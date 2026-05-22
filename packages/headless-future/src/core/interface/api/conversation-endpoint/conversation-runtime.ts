import {type ConversationEndpointCallOptions} from '@/src/api/index.js';
import {parseSSEEvent} from '@/src/api/internal/protocol/sse-parser.js';
import {readEventStream} from '@/src/api/internal/protocol/stream.js';
import type {RawSSEEvent} from '@/src/api/internal/protocol/stream-types.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import {loadConversation} from '@/src/core/interface/conversation/conversation-loader.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {ConversationEndpointFacade} from './conversation-endpoint-facade.js';
import {dispatchConversationEvent} from './conversation-event-dispatcher.js';
import {loadConversationEndpoint} from './conversation-endpoint-loader.js';
import * as conversationEndpointMutators from './conversation-endpoint-mutators.js';
import {
  getFailedTurnMutations,
  getMissingTerminalMutations,
  getStreamConnectedMutations,
  getStreamStartedMutations,
} from './conversation-turn-lifecycle.js';

interface ActiveTurnContext {
  turnId: string;
  abortController: AbortController;
  isAborted: boolean;
}

const overlappingTurnErrorMessage =
  'A conversation turn is already in progress. Please wait for completion before submitting another turn.';

export class ConversationRuntime {
  private static engineToRuntimeMap = new WeakMap<
    FullEngine,
    ConversationRuntime
  >();

  private constructor(
    private engine: FullEngine,
    private endpointFacade: ConversationEndpointFacade
  ) {
    loadConversation(engine);
    loadConversationEndpoint(engine);
  }

  static getInstance(engine: FullEngine): ConversationRuntime {
    let runtime = ConversationRuntime.engineToRuntimeMap.get(engine);

    if (!runtime) {
      runtime = new ConversationRuntime(
        engine,
        ConversationEndpointFacade.getInstance(engine)
      );
      ConversationRuntime.engineToRuntimeMap.set(engine, runtime);
    }

    return runtime;
  }

  private activeTurnContext: ActiveTurnContext | null = null;

  async submitTurn(input: string): Promise<void> {
    if (this.activeTurnContext) {
      this.engine.mutate(
        conversationMutators.setError(overlappingTurnErrorMessage)
      );
      return;
    }

    const turnId = generateId();
    const createdAt = Date.now();
    const context: ActiveTurnContext = {
      turnId,
      abortController: new AbortController(),
      isAborted: false,
    };

    this.activeTurnContext = context;

    this.engine.mutate(
      conversationMutators.startTurn({
        turnId,
        userMessageId: generateId(),
        agentMessageId: generateId(),
        input,
        createdAt,
      })
    );

    const requestOptions: ConversationEndpointCallOptions = {
      signal: context.abortController.signal,
    };

    try {
      const endpointResult = await this.endpointFacade.callEndpoint(
        input,
        requestOptions
      );

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

    this.applyMutations([
      conversationMutators.abortTurn({
        turnId: context.turnId,
        finalizedAt: Date.now(),
      }),
      conversationEndpointMutators.setStatus('idle'),
      conversationEndpointMutators.setStreamingConnected(false),
    ]);

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

    this.applyMutations(getStreamConnectedMutations());
    this.applyMutations(getStreamStartedMutations());

    let terminalEventReceived = false;
    let streamErrored = false;

    const applyRawEvent = (rawEvent: RawSSEEvent) => {
      const event = parseSSEEvent(rawEvent);
      const result = dispatchConversationEvent({
        event,
        turnId: context.turnId,
        finalizedAt: Date.now(),
      });

      this.applyMutations(result.mutations);

      if (result.isTerminalEvent) {
        terminalEventReceived = true;
      }
    };

    try {
      await readEventStream({
        stream,
        signal: context.abortController.signal,
        onEvent: applyRawEvent,
        onDone: () => {
          if (
            !this.isActiveContext(context) ||
            context.isAborted ||
            terminalEventReceived ||
            streamErrored
          ) {
            return;
          }

          this.applyMutations(
            getMissingTerminalMutations({
              turnId: context.turnId,
              finalizedAt: Date.now(),
            })
          );
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

      this.applyMutations(
        getFailedTurnMutations({
          turnId: context.turnId,
          finalizedAt: Date.now(),
          reason: 'network_error',
          error: message,
        })
      );
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

    this.applyMutations(
      getFailedTurnMutations({
        turnId: context.turnId,
        finalizedAt: Date.now(),
        reason: getFailureReason(error),
        error,
      })
    );
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
