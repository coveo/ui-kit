import {readEventStream} from '@/src/internal/api/protocol/stream.js';
import {parseSSEEvent} from '@/src/internal/api/protocol/sse-parser.js';
import {createUnifiedEndpointClient} from './unified-endpoint-client.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {RawSSEEvent} from '@/src/internal/api/protocol/stream-types.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {GenerativeStatePort} from '@/src/internal/api/generative/index.js';
import {dispatchStreamEvent} from './unified-event-dispatcher.js';
import {createConversationRequestBuilder} from './unified-conversation-request-builder.js';
import {createSurfaceProcessor} from './unified-surface-processor.js';
import type {A2uiAction, CommerceRequestModel} from './unified-endpoint-types.js';

export interface UnifiedRuntimeConfig {
  statePort: GenerativeStatePort;
  generativeInterface: InterfaceHandle;
  cartInterface: InterfaceHandle;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * True when a stream has been superseded by a newer one: a different controller
 * is now active. A plain cancel resets the active controller to null (no
 * successor), which is NOT superseded — that stream still reports its outcome.
 */
function isSuperseded(active: AbortController | null, streamController: AbortController): boolean {
  return active !== null && active !== streamController;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function extractSurfaceType(content: Record<string, unknown>): string | undefined {
  const messages = content.messages;
  if (!Array.isArray(messages)) {
    return undefined;
  }
  for (const message of messages) {
    if (isRecord(message) && 'createSurface' in message) {
      const cs = message.createSurface;
      if (isRecord(cs) && typeof cs.surfaceType === 'string') {
        return cs.surfaceType;
      }
    }
  }
  return undefined;
}

export class UnifiedRuntime {
  private static cache = new WeakMap<FullEngine, Map<string, UnifiedRuntime>>();

  private readonly configSelectors = getOrCreateConfigurationSelectors();

  private engine: FullEngine;
  private statePort: GenerativeStatePort;
  private agentResponseInitialized = new Set<string>();
  private activeAbortController: AbortController | null = null;
  private requestBuilder: ReturnType<typeof createConversationRequestBuilder>;
  private surfaceProcessor: ReturnType<typeof createSurfaceProcessor>;

  private constructor(engine: FullEngine, _interfaceId: string, config: UnifiedRuntimeConfig) {
    this.engine = engine;
    this.statePort = config.statePort;
    this.requestBuilder = createConversationRequestBuilder(
      config.generativeInterface,
      config.cartInterface
    );
    this.surfaceProcessor = createSurfaceProcessor({
      engine,
      statePort: config.statePort,
      generativeInterface: config.generativeInterface,
      cartInterface: config.cartInterface,
    });
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

    this.statePort.createTurn({id: tempId, prompt, status: 'streaming'});
    this.statePort.setActiveTurnId(tempId);

    await this.executeStream(
      tempId,
      this.requestBuilder.buildConversationRequest(this.engine, prompt)
    );
  }

  async resubmit(turnId: string, prompt: string): Promise<void> {
    this.cancel();

    this.statePort.clearTurnResponse(turnId);
    this.statePort.createTurn({id: turnId, prompt, status: 'streaming'});
    this.agentResponseInitialized.delete(turnId);

    await this.executeStream(
      turnId,
      this.requestBuilder.buildConversationRequest(this.engine, prompt)
    );
  }

  async dispatchAction(action: A2uiAction): Promise<void> {
    const turnId = this.statePort.getActiveTurnId();

    if (!turnId) {
      return;
    }

    this.cancel();

    await this.executeStream(turnId, this.requestBuilder.buildActionRequest(this.engine, action));
  }

  cancel(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }

  private async executeStream(turnId: string, agentInput: CommerceRequestModel): Promise<void> {
    const abortController = new AbortController();
    this.activeAbortController = abortController;

    try {
      const clientConfig = this.engine.read(this.configSelectors.getEndpointClientConfiguration);

      const client = createUnifiedEndpointClient();
      const result = await client.call(agentInput, clientConfig, {signal: abortController.signal});

      if (!result.success) {
        this.statePort.failTurn(turnId, result.error);
        return;
      }

      await this.consumeStream(turnId, result.data.stream, abortController);
    } catch (error) {
      // A stream aborted because a NEWER stream superseded it (e.g. a dispatched
      // action cancelling an in-flight request on the same turn) must not touch
      // the turn: the newer stream owns the outcome. A plain cancel (no successor,
      // controller reset to null) still reports the failure.
      if (isSuperseded(this.activeAbortController, abortController)) {
        return;
      }
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
    abortController: AbortController
  ): Promise<void> {
    let activeTurnId = turnId;
    let terminalEventReceived = false;

    const deps = {
      statePort: this.statePort,
      ensureAgentResponse: (tid: string) => this.ensureAgentResponse(tid),
      onA2uiSurface: (tid: string, content: Record<string, unknown>) => {
        const surfaceType = extractSurfaceType(content);

        if (!surfaceType) {
          // Legacy: surfaces without surfaceType route through the SurfaceProcessor
          // for hydration (monolithic ProductSearchSurface / ProductListingSurface).
          this.surfaceProcessor.processSnapshot(tid, content);
        }
        // Surfaces with a surfaceType (e.g. 'commerceSearch', 'converse') need no
        // routing signal — the consumer derives navigation directly from the A2-UI
        // activities already stored via appendSurface/appendActivity.
      },
    };

    await readEventStream({
      stream,
      signal: abortController.signal,
      onEvent: (rawEvent: RawSSEEvent) => {
        const event = parseSSEEvent(rawEvent);
        const result = dispatchStreamEvent(activeTurnId, event, deps);
        activeTurnId = result.turnId;
        if (result.isTerminal) {
          terminalEventReceived = true;
        }
      },
      onDone: () => {
        // A stream superseded by a newer one must not touch the turn; the newer
        // stream owns the outcome.
        if (!terminalEventReceived && !isSuperseded(this.activeAbortController, abortController)) {
          this.statePort.failTurn(activeTurnId, 'Stream ended without a terminal event.');
        }
      },
      onError: (error) => {
        if (terminalEventReceived || isSuperseded(this.activeAbortController, abortController)) {
          return;
        }
        if (isAbortError(error)) {
          this.statePort.failTurn(activeTurnId, 'Cancelled');
        } else {
          this.statePort.failTurn(activeTurnId, getErrorMessage(error));
        }
      },
    });
  }

  private ensureAgentResponse(turnId: string): void {
    if (!this.agentResponseInitialized.has(turnId)) {
      this.statePort.initAgentResponse(turnId);
      this.agentResponseInitialized.add(turnId);
    }
  }
}
