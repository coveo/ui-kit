import {readEventStream} from '@/src/internal/api/protocol/stream.js';
import {parseSSEEvent} from '@/src/internal/api/protocol/sse-parser.js';
import {createUnifiedEndpointClient} from './unified-endpoint-client.js';
import {createUnifiedEndpointRequestSelector} from './unified-request-selector.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {NormalizedStreamEvent, RawSSEEvent} from '@/src/internal/api/protocol/stream-types.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {
  GenerativeStatePort,
  HydrateSubInterface,
} from '@/src/internal/api/generative/index.js';
import type {AgUiPayloadRequest} from './unified-endpoint-types.js';

export interface UnifiedRuntimeConfig {
  statePort: GenerativeStatePort;
  hydrateSubInterface: HydrateSubInterface;
  generativeInterface: InterfaceHandle;
  cartInterface: InterfaceHandle;
}

interface DispatchResult {
  turnId: string;
  isTerminal: boolean;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
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

export class UnifiedRuntime {
  private static cache = new WeakMap<FullEngine, Map<string, UnifiedRuntime>>();

  private readonly configSelectors = getOrCreateConfigurationSelectors();

  private engine: FullEngine;
  private statePort: GenerativeStatePort;
  private agentResponseInitialized = new Set<string>();
  private currentPrompt: string | undefined;
  private activeAbortController: AbortController | null = null;
  private buildRequest: ReturnType<typeof createUnifiedEndpointRequestSelector>;

  private constructor(engine: FullEngine, _interfaceId: string, config: UnifiedRuntimeConfig) {
    this.engine = engine;
    this.statePort = config.statePort;
    this.buildRequest = createUnifiedEndpointRequestSelector(
      config.generativeInterface,
      config.cartInterface
    );
  }

  static getInstance(
    engine: FullEngine,
    interfaceId: string,
    config: UnifiedRuntimeConfig
  ): UnifiedRuntime {
    if (!UnifiedRuntime.cache.has(engine)) {
      UnifiedRuntime.cache.set(engine, new Map());
    }

    const engineRuntimes = UnifiedRuntime.cache.get(engine)!;
    let runtime = engineRuntimes.get(interfaceId);

    if (!runtime) {
      runtime = new UnifiedRuntime(engine, interfaceId, config);
      engineRuntimes.set(interfaceId, runtime);
    }

    return runtime;
  }

  async submit(prompt: string): Promise<void> {
    this.cancel();

    const tempId = generateId();

    this.currentPrompt = prompt;
    this.statePort.createTurn({id: tempId, prompt, status: 'streaming'});
    this.statePort.setActiveTurnId(tempId);

    await this.executeStream(tempId);
  }

  async resubmit(turnId: string, prompt: string): Promise<void> {
    this.cancel();

    this.currentPrompt = prompt;
    this.statePort.clearTurnResponse(turnId);
    this.statePort.createTurn({id: turnId, prompt, status: 'streaming'});
    this.agentResponseInitialized.delete(turnId);

    await this.executeStream(turnId);
  }

  cancel(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }

  private async executeStream(turnId: string): Promise<void> {
    const abortController = new AbortController();
    this.activeAbortController = abortController;

    try {
      const {cart, conversationSessionId, conversationToken, ...fromState} = this.engine.read(
        this.buildRequest
      );
      const navigatorContext = this.engine.getNavigatorContextProvider()?.();
      const clientConfig = this.engine.read(this.configSelectors.getEndpointClientConfiguration);

      const prompt = this.currentPrompt ?? '';

      const request: AgUiPayloadRequest = {
        session: {
          threadId: conversationSessionId || generateId(),
          clientMessageId: generateId(),
          continuationTokens: {},
        },
        messages: [{id: generateId(), role: 'user', content: prompt}],
        requestContext: {},
        forwardedProps: {},
        agentInput: {
          trackingId: fromState.trackingId,
          language: fromState.language,
          country: fromState.country,
          currency: fromState.currency,
          clientId: navigatorContext?.clientId ?? undefined,
          message: prompt,
          action: null,
          conversationSessionId,
          conversationToken,
          context: {
            view: {
              url: navigatorContext?.location ?? null,
              referrer: navigatorContext?.referrer ?? null,
            },
            user: {userAgent: navigatorContext?.userAgent ?? null},
            cart: cart ?? [],
            source: [],
            custom: {},
          },
          pinnedProducts: [],
        },
      };

      const client = createUnifiedEndpointClient();
      const result = await client.call(request, clientConfig, {signal: abortController.signal});

      if (!result.success) {
        this.statePort.failTurn(turnId, result.error);
        return;
      }

      await this.consumeStream(turnId, result.data.stream, abortController.signal);
    } catch (error) {
      if (isAbortError(error)) {
        this.statePort.failTurn(turnId, 'Cancelled');
        return;
      }
      this.statePort.failTurn(turnId, getErrorMessage(error));
    } finally {
      if (this.activeAbortController === abortController) {
        this.activeAbortController = null;
      }
    }
  }

  private async consumeStream(
    turnId: string,
    stream: ReadableStream<Uint8Array>,
    signal: AbortSignal
  ): Promise<void> {
    let activeTurnId = turnId;
    let terminalEventReceived = false;

    await readEventStream({
      stream,
      signal,
      onEvent: (rawEvent: RawSSEEvent) => {
        const event = parseSSEEvent(rawEvent);
        const result = this.dispatchEvent(activeTurnId, event);
        activeTurnId = result.turnId;
        if (result.isTerminal) {
          terminalEventReceived = true;
        }
      },
      onDone: () => {
        if (!terminalEventReceived) {
          this.statePort.failTurn(activeTurnId, 'Stream ended without a terminal event.');
        }
      },
      onError: (error) => {
        if (!terminalEventReceived) {
          if (isAbortError(error)) {
            this.statePort.failTurn(activeTurnId, 'Cancelled');
          } else {
            this.statePort.failTurn(activeTurnId, getErrorMessage(error));
          }
        }
      },
    });
  }

  private dispatchEvent(turnId: string, event: NormalizedStreamEvent): DispatchResult {
    switch (event.type) {
      case 'turn_started': {
        if (event.conversationSessionId || event.conversationToken) {
          this.statePort.setConversationSession(
            event.conversationSessionId,
            event.conversationToken
          );
        }
        return {turnId, isTerminal: false};
      }

      case 'TEXT_MESSAGE_START': {
        this.ensureAgentResponse(turnId);
        this.statePort.startMessage(turnId, event.role ?? 'assistant');
        return {turnId, isTerminal: false};
      }

      case 'TEXT_MESSAGE_CONTENT': {
        this.ensureAgentResponse(turnId);
        this.statePort.appendMessageDelta(turnId, event.delta);
        return {turnId, isTerminal: false};
      }

      case 'TEXT_MESSAGE_END': {
        return {turnId, isTerminal: false};
      }

      case 'REASONING_MESSAGE_START': {
        this.ensureAgentResponse(turnId);
        this.statePort.startReasoning(turnId);
        return {turnId, isTerminal: false};
      }

      case 'REASONING_MESSAGE_CONTENT': {
        this.ensureAgentResponse(turnId);
        this.statePort.appendReasoningDelta(turnId, event.delta);
        return {turnId, isTerminal: false};
      }

      case 'REASONING_MESSAGE_END': {
        this.statePort.endReasoning(turnId);
        return {turnId, isTerminal: false};
      }

      case 'TOOL_CALL_START': {
        this.ensureAgentResponse(turnId);
        this.statePort.startToolCall(turnId, event.toolCallId, event.toolCallName);
        return {turnId, isTerminal: false};
      }

      case 'TOOL_CALL_ARGS': {
        this.statePort.appendToolCallArgs(turnId, event.toolCallId, event.delta);
        return {turnId, isTerminal: false};
      }

      case 'TOOL_CALL_END': {
        return {turnId, isTerminal: false};
      }

      case 'TOOL_CALL_RESULT': {
        this.statePort.completeToolCall(turnId, event.toolCallId, event.content);
        return {turnId, isTerminal: false};
      }

      case 'ACTIVITY_SNAPSHOT': {
        this.ensureAgentResponse(turnId);
        this.statePort.appendSurface(turnId, event.content as Record<string, unknown>);
        return {turnId, isTerminal: false};
      }

      case 'RUN_STARTED':
      case 'RUN_FINISHED':
      case 'STATE_SNAPSHOT':
      case 'CUSTOM': {
        return {turnId, isTerminal: false};
      }

      case 'turn_complete': {
        if (event.conversationSessionId || event.conversationToken) {
          this.statePort.setConversationSession(
            event.conversationSessionId,
            event.conversationToken
          );
        }
        this.statePort.completeTurn(turnId);
        return {turnId, isTerminal: true};
      }

      case 'RUN_ERROR': {
        this.statePort.failTurn(turnId, event.message || 'An error occurred during the turn.');
        return {turnId, isTerminal: true};
      }

      default:
        return this.handleUnknownEvent(turnId, event);
    }
  }

  private handleUnknownEvent(turnId: string, event: NormalizedStreamEvent): DispatchResult {
    const rawEvent = event as unknown as Record<string, unknown>;
    if (rawEvent.type === 'error') {
      if (
        (rawEvent as {conversationSessionId?: string}).conversationSessionId ||
        (rawEvent as {conversationToken?: string}).conversationToken
      ) {
        this.statePort.setConversationSession(
          (rawEvent as {conversationSessionId?: string}).conversationSessionId,
          (rawEvent as {conversationToken?: string}).conversationToken
        );
      }
      const errorObj = rawEvent.error;
      const message =
        typeof errorObj === 'object' && errorObj !== null && 'message' in errorObj
          ? String((errorObj as {message: unknown}).message)
          : 'A gateway error occurred.';
      this.statePort.failTurn(turnId, message);
      return {turnId, isTerminal: true};
    }

    return {turnId, isTerminal: false};
  }

  private ensureAgentResponse(turnId: string): void {
    if (!this.agentResponseInitialized.has(turnId)) {
      this.statePort.initAgentResponse(turnId);
      this.agentResponseInitialized.add(turnId);
    }
  }
}
