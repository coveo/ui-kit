import {
  type ConversationEndpointCallOptions,
  readConversationEventStream,
  type ConversationStreamEvent,
} from '@/src/api/index.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {ConversationEndpointFacade} from './conversation-endpoint-facade.js';
import {
  dispatchConversationEvent,
  type ConversationDispatchEffect,
} from './conversation-event-dispatcher.js';
import {loadConversationEndpoint} from './conversation-endpoint-loader.js';
import * as conversationEndpointMutators from './conversation-endpoint-mutators.js';

interface ActiveTurnContext {
  turnId: string;
  abortController: AbortController;
  isAborted: boolean;
}

const overlappingTurnErrorMessage =
  'A conversation turn is already in progress. Please wait for completion before submitting another turn.';

const missingTerminalErrorMessage =
  'Conversation stream ended before a terminal event was received.';

export interface ConversationSubmitTurnOptions {
  conversationSessionId?: string | null;
  conversationToken?: string | null;
}

export interface ConversationRuntimeSession {
  conversationSessionId?: string;
  conversationToken?: string;
}

export interface ConversationRuntimeStartTurnPayload {
  turnId: string;
  userMessageId: string;
  agentMessageId: string;
  input: string;
  createdAt: number;
}

export interface ConversationRuntimeFinalizeTurnPayload {
  turnId: string;
  finalizedAt: number;
}

export type ConversationRuntimeFailReason =
  | 'network_error'
  | 'auth_error'
  | 'stream_interrupted'
  | 'protocol_error';

export interface ConversationRuntimeAppendAgentChunkPayload {
  turnId: string;
  chunk: string;
}

export interface ConversationRuntimeFailTurnPayload extends ConversationRuntimeFinalizeTurnPayload {
  reason: ConversationRuntimeFailReason;
}

export interface ConversationRuntimeStatePort {
  readSession: () => ConversationRuntimeSession;
  setSession: (session: ConversationRuntimeSession) => void;
  patchSession: (sessionPatch: ConversationRuntimeSession) => void;
  setError: (error: string | null) => void;
  startTurn: (payload: ConversationRuntimeStartTurnPayload) => void;
  abortTurn: (payload: ConversationRuntimeFinalizeTurnPayload) => void;
  appendAgentChunk: (
    payload: ConversationRuntimeAppendAgentChunkPayload
  ) => void;
  completeTurn: (payload: ConversationRuntimeFinalizeTurnPayload) => void;
  failTurn: (payload: ConversationRuntimeFailTurnPayload) => void;
}

export class ConversationRuntime {
  private static engineToRuntimeMap = new WeakMap<
    FullEngine,
    ConversationRuntime
  >();

  private constructor(
    private engine: FullEngine,
    private endpointFacade: ConversationEndpointFacade,
    private conversationState: ConversationRuntimeStatePort
  ) {
    loadConversationEndpoint(engine);
  }

  static getInstance(
    engine: FullEngine,
    conversationState: ConversationRuntimeStatePort
  ): ConversationRuntime {
    let runtime = ConversationRuntime.engineToRuntimeMap.get(engine);

    if (!runtime) {
      runtime = new ConversationRuntime(
        engine,
        ConversationEndpointFacade.getInstance(engine),
        conversationState
      );
      ConversationRuntime.engineToRuntimeMap.set(engine, runtime);
    }

    return runtime;
  }

  private activeTurnContext: ActiveTurnContext | null = null;

  async submitTurn(
    input: string,
    options?: ConversationSubmitTurnOptions
  ): Promise<void> {
    if (this.activeTurnContext) {
      this.conversationState.setError(overlappingTurnErrorMessage);
      return;
    }

    this.applySessionContinuationOverrides(options);

    const turnId = generateId();
    const createdAt = Date.now();
    const context: ActiveTurnContext = {
      turnId,
      abortController: new AbortController(),
      isAborted: false,
    };

    this.activeTurnContext = context;

    this.conversationState.startTurn({
      turnId,
      userMessageId: generateId(),
      agentMessageId: generateId(),
      input,
      createdAt,
    });

    const requestOptions: ConversationEndpointCallOptions = {
      signal: context.abortController.signal,
    };

    try {
      const endpointResult =
        await this.endpointFacade.callEndpoint(requestOptions);

      if (!this.isActiveContext(context)) {
        return;
      }

      if (!endpointResult.success) {
        this.handleEndpointFailure(context, endpointResult.error);
        return;
      }

      await this.consumeStream(context, endpointResult.data.stream);
    } finally {
      this.clearActiveContext(context);
    }
  }

  abortTurn(): void {
    const context = this.activeTurnContext;

    if (!context) {
      return;
    }

    context.isAborted = true;

    const finalizedAt = Date.now();

    this.conversationState.abortTurn({
      turnId: context.turnId,
      finalizedAt,
    });

    this.applyEndpointStoppedMutations();

    context.abortController.abort();
    this.clearActiveContext(context);
  }

  private async consumeStream(
    context: ActiveTurnContext,
    stream: ReadableStream<Uint8Array>
  ) {
    if (!this.isActiveContext(context)) {
      return;
    }

    this.applyMutations([
      conversationEndpointMutators.setStreamingConnected(true),
      conversationEndpointMutators.setStatus('streaming'),
    ]);

    let terminalEventReceived = false;
    let streamErrored = false;

    const applyEvent = (event: ConversationStreamEvent) => {
      const result = dispatchConversationEvent({event});

      this.applyEventEffects({
        effects: result.effects,
        turnId: context.turnId,
        finalizedAt: Date.now(),
      });

      if (result.isTerminalEvent) {
        terminalEventReceived = true;
      }
    };

    try {
      await readConversationEventStream({
        stream,
        signal: context.abortController.signal,
        onEvent: applyEvent,
        onDone: () => {
          if (
            !this.isActiveContext(context) ||
            context.isAborted ||
            terminalEventReceived ||
            streamErrored
          ) {
            return;
          }

          this.applyFailedTurnLifecycle({
            turnId: context.turnId,
            finalizedAt: Date.now(),
            reason: 'stream_interrupted',
            error: missingTerminalErrorMessage,
          });
        },
      });
    } catch (error) {
      if (
        !this.isActiveContext(context) ||
        context.isAborted ||
        isAbortError(error)
      ) {
        return;
      }

      streamErrored = true;
      const message = getErrorMessage(error);

      this.applyFailedTurnLifecycle({
        turnId: context.turnId,
        finalizedAt: Date.now(),
        reason: 'network_error',
        error: message,
      });
    }
  }

  private handleEndpointFailure(context: ActiveTurnContext, error: string) {
    if (
      !this.isActiveContext(context) ||
      context.isAborted ||
      isAbortError(error)
    ) {
      return;
    }

    this.applyFailedTurnLifecycle({
      turnId: context.turnId,
      finalizedAt: Date.now(),
      reason: getFailureReason(error),
      error,
    });
  }

  private applyEventEffects({
    effects,
    turnId,
    finalizedAt,
  }: {
    effects: ConversationDispatchEffect[];
    turnId: string;
    finalizedAt: number;
  }) {
    for (const effect of effects) {
      switch (effect.type) {
        case 'append_agent_chunk':
          this.conversationState.appendAgentChunk({
            turnId,
            chunk: effect.chunk,
          });
          break;

        case 'patch_session':
          this.conversationState.patchSession(effect.sessionPatch);
          break;

        case 'complete_turn':
          this.conversationState.completeTurn({
            turnId,
            finalizedAt,
          });
          this.applyEndpointStoppedMutations();
          break;

        case 'fail_turn':
          this.applyFailedTurnLifecycle({
            turnId,
            finalizedAt,
            reason: effect.reason,
            error: effect.error,
          });
          break;

        case 'set_endpoint_error':
          this.applyMutations([
            conversationEndpointMutators.setError(effect.error),
          ]);
          break;
      }
    }
  }

  private applyFailedTurnLifecycle({
    turnId,
    finalizedAt,
    reason,
    error,
  }: {
    turnId: string;
    finalizedAt: number;
    reason: ConversationRuntimeFailReason;
    error: string;
  }) {
    this.conversationState.failTurn({
      turnId,
      finalizedAt,
      reason,
    });
    this.conversationState.setError(error);
    this.applyEndpointStoppedMutations(error);
  }

  private applyEndpointStoppedMutations(error?: string) {
    this.applyMutations([
      ...(error !== undefined
        ? [conversationEndpointMutators.setError(error)]
        : []),
      conversationEndpointMutators.setStatus('idle'),
      conversationEndpointMutators.setStreamingConnected(false),
    ]);
  }

  private applyMutations(mutations: Array<{type: string; payload?: unknown}>) {
    for (const mutation of mutations) {
      this.engine.mutate(mutation);
    }
  }

  private isActiveContext(context: ActiveTurnContext): boolean {
    return this.activeTurnContext === context;
  }

  private clearActiveContext(context: ActiveTurnContext) {
    if (this.activeTurnContext === context) {
      this.activeTurnContext = null;
    }
  }

  private applySessionContinuationOverrides(
    options?: ConversationSubmitTurnOptions
  ) {
    if (!options) {
      return;
    }

    const hasSessionIdOverride = hasOwnKey(options, 'conversationSessionId');
    const hasConversationTokenOverride = hasOwnKey(
      options,
      'conversationToken'
    );

    if (!hasSessionIdOverride && !hasConversationTokenOverride) {
      return;
    }

    const currentSession = this.conversationState.readSession();
    const nextSession = {...currentSession};

    if (hasSessionIdOverride) {
      const normalizedSessionId = normalizeContinuationField(
        options.conversationSessionId
      );

      if (normalizedSessionId) {
        nextSession.conversationSessionId = normalizedSessionId;
      } else {
        delete nextSession.conversationSessionId;
      }
    }

    if (hasConversationTokenOverride) {
      const normalizedConversationToken = normalizeContinuationField(
        options.conversationToken
      );

      if (normalizedConversationToken) {
        nextSession.conversationToken = normalizedConversationToken;
      } else {
        delete nextSession.conversationToken;
      }
    }

    this.conversationState.setSession(nextSession);
  }
}

function hasOwnKey<TObject extends object>(
  value: TObject,
  key: string
): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function normalizeContinuationField(
  value: string | null | undefined
): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function generateId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'AbortError';
  }

  if (typeof error === 'string') {
    return /abort/i.test(error);
  }

  return false;
}

function getFailureReason(error: string): 'auth_error' | 'network_error' {
  return /access token|unauthorized|forbidden|401|403/i.test(error)
    ? 'auth_error'
    : 'network_error';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return 'An unexpected error occurred while reading the conversation stream.';
}
