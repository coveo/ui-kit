import {
  readConversationEventStream,
  type ConversationStreamEvent,
  createConversationEndpointClient,
  type CoveoConversationEndpointRequest,
} from '@/src/internal/api/conversation/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createConversationEndpointRequestSelector} from '@/src/internal/api/conversation/index.js';
import {readEndpointClientConfiguration} from '@/src/internal/features/configuration/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {
  A2UISurface,
  RoutedInterface,
  TurnStatus,
} from '@/src/internal/features/generative/index.js';

export interface GenerativeStatePort {
  createTurn(payload: {id: string; prompt: string; status: TurnStatus}): void;
  setActiveTurnId(id: string): void;
  replaceTurnId(oldId: string, newId: string): void;
  setRoutedInterface(turnId: string, routedInterface: RoutedInterface): void;
  initAgentResponse(turnId: string): void;
  startMessage(turnId: string, role: string): void;
  appendMessageDelta(turnId: string, delta: string): void;
  appendSurface(turnId: string, surface: A2UISurface): void;
  startToolCall(turnId: string, toolCallId: string, toolName: string): void;
  appendToolCallArgs(turnId: string, toolCallId: string, delta: string): void;
  completeToolCall(turnId: string, toolCallId: string, result: string): void;
  setStateSnapshot(turnId: string, snapshot: Record<string, unknown>): void;
  completeTurn(turnId: string): void;
  failTurn(turnId: string, error: string): void;
  clearTurnResponse(turnId: string): void;
  startReasoning(turnId: string): void;
  appendReasoningDelta(turnId: string, delta: string): void;
  endReasoning(turnId: string): void;
}

export type HydrateSubInterface = (
  activityType: string,
  content: unknown,
  query?: string
) => RoutedInterface | null;

export interface GenerativeRuntimeConfig {
  statePort: GenerativeStatePort;
  hydrateSubInterface: HydrateSubInterface;
  generativeInterface: InterfaceHandle;
  cartInterface: InterfaceHandle;
}

export class GenerativeRuntime {
  private static cache = new WeakMap<
    FullEngine,
    Map<string, GenerativeRuntime>
  >();

  private engine: FullEngine;
  private statePort: GenerativeStatePort;
  private hydrateSubInterface: HydrateSubInterface;
  private agentResponseInitialized = new Set<string>();
  private currentPrompt: string | undefined;
  private conversationSessionId: string | undefined;
  private conversationToken: string | undefined;
  private buildRequest: ReturnType<
    typeof createConversationEndpointRequestSelector
  >;

  private constructor(
    engine: FullEngine,
    _interfaceId: string,
    config: GenerativeRuntimeConfig
  ) {
    this.engine = engine;
    this.statePort = config.statePort;
    this.hydrateSubInterface = config.hydrateSubInterface;
    this.buildRequest = createConversationEndpointRequestSelector(
      config.generativeInterface,
      config.cartInterface
    );
  }

  static getInstance(
    engine: FullEngine,
    interfaceId: string,
    config: GenerativeRuntimeConfig
  ): GenerativeRuntime {
    if (!GenerativeRuntime.cache.has(engine)) {
      GenerativeRuntime.cache.set(engine, new Map());
    }

    const engineRuntimes = GenerativeRuntime.cache.get(engine)!;
    let runtime = engineRuntimes.get(interfaceId);

    if (!runtime) {
      runtime = new GenerativeRuntime(engine, interfaceId, config);
      engineRuntimes.set(interfaceId, runtime);
    }

    return runtime;
  }

  async submit(prompt: string): Promise<void> {
    const tempId = generateId();

    this.currentPrompt = prompt;
    this.statePort.createTurn({id: tempId, prompt, status: 'streaming'});
    this.statePort.setActiveTurnId(tempId);

    await this.executeStream(tempId);
  }

  async resubmit(turnId: string, prompt: string): Promise<void> {
    this.currentPrompt = prompt;
    this.statePort.clearTurnResponse(turnId);
    this.statePort.createTurn({id: turnId, prompt, status: 'streaming'});
    this.agentResponseInitialized.delete(turnId);

    await this.executeStream(turnId);
  }

  private async executeStream(turnId: string): Promise<void> {
    try {
      const requestFromState = this.engine.read(this.buildRequest);
      const navigatorContext = this.engine.getNavigatorContextProvider()?.();
      const clientConfig = readEndpointClientConfiguration(this.engine);

      const request: CoveoConversationEndpointRequest = {
        trackingId: requestFromState.trackingId,
        language: requestFromState.language,
        country: requestFromState.country,
        currency: requestFromState.currency,
        message: requestFromState.message,
        clientId: navigatorContext?.clientId ?? undefined,
        context: {
          user: {
            userAgent: navigatorContext?.userAgent ?? null,
          },
          view: {
            url: navigatorContext?.location ?? null,
            referrer: navigatorContext?.referrer ?? null,
          },
          ...(requestFromState.cart.length > 0
            ? {cart: requestFromState.cart}
            : {}),
        },
        ...(this.conversationSessionId
          ? {conversationSessionId: this.conversationSessionId}
          : {}),
        ...(this.conversationToken
          ? {conversationToken: this.conversationToken}
          : {}),
        targetEngine: 'AGENT_CORE',
      };

      const client = createConversationEndpointClient();
      const result = await client.call(request, clientConfig);

      if (!result.success) {
        this.statePort.failTurn(turnId, result.error);
        return;
      }

      await this.consumeStream(turnId, result.data.stream);
    } catch (error) {
      this.statePort.failTurn(turnId, getErrorMessage(error));
    }
  }

  private async consumeStream(
    turnId: string,
    stream: ReadableStream<Uint8Array>
  ): Promise<void> {
    let activeTurnId = turnId;
    let terminalEventReceived = false;

    await readConversationEventStream({
      stream,
      onEvent: (event) => {
        const result = this.dispatchEvent(activeTurnId, event);
        activeTurnId = result.turnId;
        if (result.isTerminal) {
          terminalEventReceived = true;
        }
      },
      onDone: () => {
        if (!terminalEventReceived) {
          this.statePort.failTurn(
            activeTurnId,
            'Stream ended without a terminal event.'
          );
        }
      },
      onError: (error) => {
        if (!terminalEventReceived) {
          this.statePort.failTurn(activeTurnId, getErrorMessage(error));
        }
      },
    });
  }

  private dispatchEvent(
    turnId: string,
    event: ConversationStreamEvent
  ): {turnId: string; isTerminal: boolean} {
    switch (event.type) {
      case 'turn_started': {
        if (event.conversationSessionId) {
          this.conversationSessionId = event.conversationSessionId;
        }
        if (event.conversationToken) {
          this.conversationToken = event.conversationToken;
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
        this.statePort.startReasoning(turnId);
        return {turnId, isTerminal: false};
      }

      case 'REASONING_MESSAGE_CONTENT': {
        this.statePort.appendReasoningDelta(turnId, event.delta);
        return {turnId, isTerminal: false};
      }

      case 'REASONING_MESSAGE_END': {
        this.statePort.endReasoning(turnId);
        return {turnId, isTerminal: false};
      }

      case 'TOOL_CALL_START': {
        this.ensureAgentResponse(turnId);
        this.statePort.startToolCall(
          turnId,
          event.toolCallId,
          event.toolCallName
        );
        return {turnId, isTerminal: false};
      }

      case 'TOOL_CALL_ARGS': {
        this.statePort.appendToolCallArgs(
          turnId,
          event.toolCallId,
          event.delta
        );
        return {turnId, isTerminal: false};
      }

      case 'TOOL_CALL_END': {
        return {turnId, isTerminal: false};
      }

      case 'TOOL_CALL_RESULT': {
        this.statePort.completeToolCall(
          turnId,
          event.toolCallId,
          event.content
        );
        return {turnId, isTerminal: false};
      }

      case 'STATE_SNAPSHOT': {
        this.statePort.setStateSnapshot(turnId, event.snapshot);
        return {turnId, isTerminal: false};
      }

      case 'ACTIVITY_SNAPSHOT': {
        const routedInterface = this.hydrateSubInterface(
          event.activityType,
          event.content,
          this.currentPrompt
        );

        if (routedInterface) {
          this.statePort.setRoutedInterface(turnId, routedInterface);
          this.statePort.completeTurn(turnId);
          return {turnId, isTerminal: true};
        }

        this.ensureAgentResponse(turnId);
        this.statePort.appendSurface(
          turnId,
          event.content as Record<string, unknown>
        );
        return {turnId, isTerminal: false};
      }

      case 'turn_complete': {
        if (event.conversationSessionId) {
          this.conversationSessionId = event.conversationSessionId;
        }
        if (event.conversationToken) {
          this.conversationToken = event.conversationToken;
        }
        this.statePort.completeTurn(turnId);
        return {turnId, isTerminal: true};
      }

      case 'RUN_ERROR': {
        this.statePort.failTurn(
          turnId,
          event.message || 'An error occurred during the turn.'
        );
        return {turnId, isTerminal: true};
      }

      case 'RUN_FINISHED': {
        this.statePort.completeTurn(turnId);
        return {turnId, isTerminal: true};
      }

      default:
        return {turnId, isTerminal: false};
    }
  }

  private ensureAgentResponse(turnId: string): void {
    if (!this.agentResponseInitialized.has(turnId)) {
      this.statePort.initAgentResponse(turnId);
      this.agentResponseInitialized.add(turnId);
    }
  }
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
