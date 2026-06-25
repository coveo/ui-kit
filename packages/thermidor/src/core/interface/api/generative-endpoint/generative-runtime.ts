import {
  readConversationEventStream,
  type ConversationStreamEvent,
  createConversationEndpointClient,
  type CoveoConversationEndpointRequest,
} from '@/src/api/index.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {createConversationEndpointRequestSelector} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-request-selector.js';
import {readEndpointClientConfiguration} from '@/src/core/internal/configuration/configuration-reader.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import type {
  A2UISurface,
  TurnStatus,
} from '@/src/core/interface/generative/generative-types.js';

export interface GenerativeStatePort {
  createTurn(payload: {id: string; prompt: string; status: TurnStatus}): void;
  setActiveTurnId(id: string): void;
  replaceTurnId(oldId: string, newId: string): void;
  initAgentResponse(turnId: string): void;
  startMessage(turnId: string, role: string): void;
  appendMessageDelta(turnId: string, delta: string): void;
  appendSurface(turnId: string, surface: A2UISurface): void;
  startToolCall(turnId: string, toolCallId: string, toolName: string): void;
  appendToolCallArgs(turnId: string, toolCallId: string, delta: string): void;
  completeToolCall(turnId: string, toolCallId: string, result: string): void;
  completeTurn(turnId: string): void;
  failTurn(turnId: string, error: string): void;
  clearTurnResponse(turnId: string): void;
  createBackendInterface(
    interfaceId: string,
    type: string,
    display: string,
    state: Record<string, unknown>
  ): void;
  updateBackendInterfaceState(
    interfaceId: string,
    state: Record<string, unknown>,
    display?: string
  ): void;
  updateSuggestions(
    interfaceId: string,
    suggestions: Record<string, unknown>
  ): void;
}

export interface GenerativeRuntimeConfig {
  statePort: GenerativeStatePort;
  generativeInterfaceId: string;
  cartInterfaceId: string;
}

export class GenerativeRuntime {
  private static cache = new WeakMap<
    FullEngine,
    Map<string, GenerativeRuntime>
  >();

  private engine: FullEngine;
  private statePort: GenerativeStatePort;
  private agentResponseInitialized = new Set<string>();
  private currentPrompt: string | undefined;
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
    this.buildRequest = createConversationEndpointRequestSelector(
      config.generativeInterfaceId,
      config.cartInterfaceId
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

  async submitAction(action: Record<string, unknown>): Promise<void> {
    const tempId = generateId();
    const prompt = `[action:${(action as {type?: string}).type ?? 'unknown'}]`;

    this.statePort.createTurn({id: tempId, prompt, status: 'streaming'});
    this.statePort.setActiveTurnId(tempId);

    await this.executeActionStream(tempId, action);
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

  private async executeActionStream(
    turnId: string,
    action: Record<string, unknown>
  ): Promise<void> {
    try {
      const requestFromState = this.engine.read(this.buildRequest);
      const navigatorContext = this.engine.getNavigatorContextProvider()?.();
      const clientConfig = readEndpointClientConfiguration(this.engine);

      const request: CoveoConversationEndpointRequest = {
        trackingId: requestFromState.trackingId,
        language: requestFromState.language,
        country: requestFromState.country,
        currency: requestFromState.currency,
        clientId: navigatorContext?.clientId ?? undefined,
        action,
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

      case 'CUSTOM': {
        const value = event.value as Record<string, unknown> | undefined;
        if (!value) {
          return {turnId, isTerminal: false};
        }
        switch (event.name) {
          case 'coveo.interfaceCreated': {
            this.statePort.createBackendInterface(
              value.interfaceId as string,
              value.type as string,
              value.display as string,
              value.state as Record<string, unknown>
            );
            return {turnId, isTerminal: false};
          }
          case 'coveo.stateUpdate': {
            this.statePort.updateBackendInterfaceState(
              value.interfaceId as string,
              value.state as Record<string, unknown>,
              value.display as string | undefined
            );
            return {turnId, isTerminal: false};
          }
          case 'coveo.suggestions': {
            const {interfaceId, ...suggestions} = value;
            this.statePort.updateSuggestions(
              interfaceId as string,
              suggestions
            );
            return {turnId, isTerminal: false};
          }
          default:
            return {turnId, isTerminal: false};
        }
      }

      case 'turn_complete': {
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
