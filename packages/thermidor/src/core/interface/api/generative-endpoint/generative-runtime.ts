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
import type {
  A2UIOperation,
  A2UISurfaceActivityContent,
} from '@/src/api/internal/protocol/stream-types.js';
import {A2UI_SURFACE_ACTIVITY_TYPE} from '@/src/api/internal/protocol/stream-types.js';
import {
  isStatefulSurfaceComponent,
  surfaceTypeFromComponent,
} from '@/src/core/internal/backend-surfaces/catalog.js';

/**
 * Actions with `wantResponse: false` are fire-and-forget ACK-only turns
 * (analytics / cart). Everything else expects an `actionResponse`.
 */
const ACK_ONLY_ACTIONS = new Set<string>([
  'product_click',
  'product_view',
  'cart_action',
  'purchase',
]);

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
  createBackendSurface(
    surfaceId: string,
    type: string,
    display: string,
    state: Record<string, unknown>,
    turnId?: string
  ): void;
  updateBackendSurfaceState(
    surfaceId: string,
    path: string,
    value: unknown
  ): void;
  deleteBackendSurface(surfaceId: string): void;
  updateSuggestions(
    surfaceId: string,
    suggestions: Record<string, unknown>
  ): void;
  setConversationSessionId(sessionId: string): void;
  setConversationToken(token: string): void;
  updateFacetSearchResults(
    surfaceId: string,
    results: Record<string, unknown>
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
  private conversationSessionId: string | undefined;
  private conversationToken: string | undefined;
  private activeMainSurfaceId: string | undefined;
  private pendingActionIds = new Set<string>();
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

    this.statePort.createTurn({id: tempId, prompt, status: 'streaming'});
    this.statePort.setActiveTurnId(tempId);

    await this.executeStream(tempId);
  }

  async resubmit(turnId: string, prompt: string): Promise<void> {
    this.statePort.clearTurnResponse(turnId);
    this.statePort.createTurn({id: turnId, prompt, status: 'streaming'});
    this.agentResponseInitialized.delete(turnId);

    await this.executeStream(turnId);
  }

  async submitAction(action: Record<string, unknown>): Promise<void> {
    const tempId = generateId();
    const name = (action as {type?: string}).type ?? 'unknown';
    const prompt = `[action:${name}]`;

    this.statePort.createTurn({id: tempId, prompt, status: 'streaming'});
    this.statePort.setActiveTurnId(tempId);

    await this.executeActionStream(tempId, this.toA2uiActionEnvelope(action));
  }

  /**
   * Translate the ergonomic, typed controller action into the A2UI v1.0
   * action envelope: `{surfaceId, name, actionId, wantResponse, context}`.
   * The `type` discriminator becomes `name`; all remaining fields (other than
   * `surfaceId`) become `context`.
   */
  private toA2uiActionEnvelope(
    action: Record<string, unknown>
  ): Record<string, unknown> {
    const {type, surfaceId, ...rest} = action as {
      type?: string;
      surfaceId?: string;
      [key: string]: unknown;
    };

    const name = type ?? 'unknown';
    const actionId = generateId();
    const wantResponse = !ACK_ONLY_ACTIONS.has(name);
    const resolvedSurfaceId = surfaceId ?? this.activeMainSurfaceId;

    if (wantResponse) {
      this.pendingActionIds.add(actionId);
    }

    return {
      ...(resolvedSurfaceId ? {surfaceId: resolvedSurfaceId} : {}),
      name,
      actionId,
      wantResponse,
      context: rest,
    };
  }

  restoreSession(sessionId: string, token: string): void {
    this.conversationSessionId = sessionId;
    this.conversationToken = token;
    this.statePort.setConversationSessionId(sessionId);
    this.statePort.setConversationToken(token);
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
        conversationSessionId: this.conversationSessionId,
        conversationToken: this.conversationToken,
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
        conversationSessionId: this.conversationSessionId,
        conversationToken: this.conversationToken,
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
        if (event.conversationSessionId) {
          this.conversationSessionId = event.conversationSessionId;
          this.statePort.setConversationSessionId(event.conversationSessionId);
        }
        if (event.conversationToken) {
          this.conversationToken = event.conversationToken;
          this.statePort.setConversationToken(event.conversationToken);
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

      case 'ACTIVITY_SNAPSHOT': {
        const activityType = (event as {activityType?: string}).activityType;
        if (activityType !== A2UI_SURFACE_ACTIVITY_TYPE) {
          return {turnId, isTerminal: false};
        }
        const content = (
          event as unknown as {content?: A2UISurfaceActivityContent}
        ).content;
        const operations = content?.operations;
        if (!Array.isArray(operations)) {
          return {turnId, isTerminal: false};
        }
        for (const operation of operations) {
          this.applyA2uiOperation(turnId, operation);
        }
        return {turnId, isTerminal: false};
      }

      case 'CUSTOM': {
        const value = event.value as Record<string, unknown> | undefined;
        if (!value) {
          return {turnId, isTerminal: false};
        }
        switch (event.name) {
          case 'coveo.suggestions': {
            const {surfaceId, ...suggestions} = value;
            this.statePort.updateSuggestions(surfaceId as string, suggestions);
            return {turnId, isTerminal: false};
          }
          case 'coveo.facetSearchResults': {
            this.statePort.updateFacetSearchResults(
              value.surfaceId as string,
              value as Record<string, unknown>
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

  private applyA2uiOperation(turnId: string, operation: A2UIOperation): void {
    if ('createSurface' in operation) {
      const {surfaceId, components, dataModel, surfaceProperties} =
        operation.createSurface;
      const rootComponent = components?.[0]?.component ?? '';

      if (isStatefulSurfaceComponent(rootComponent)) {
        const placement = surfaceProperties?.placement ?? 'main';
        this.statePort.createBackendSurface(
          surfaceId,
          surfaceTypeFromComponent(rootComponent),
          placement,
          dataModel ?? {},
          turnId
        );
        if (placement === 'main') {
          this.activeMainSurfaceId = surfaceId;
        }
      } else {
        this.ensureAgentResponse(turnId);
        this.statePort.appendSurface(
          turnId,
          operation.createSurface as unknown as A2UISurface
        );
      }
      return;
    }

    if ('updateDataModel' in operation) {
      const {surfaceId, path, value} = operation.updateDataModel;
      this.statePort.updateBackendSurfaceState(surfaceId, path, value);
      return;
    }

    if ('actionResponse' in operation) {
      this.pendingActionIds.delete(operation.actionResponse.actionId);
      return;
    }

    if ('deleteSurface' in operation) {
      const {surfaceId} = operation.deleteSurface;
      this.statePort.deleteBackendSurface(surfaceId);
      if (this.activeMainSurfaceId === surfaceId) {
        this.activeMainSurfaceId = undefined;
      }
      return;
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
