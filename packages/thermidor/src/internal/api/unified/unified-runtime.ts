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

export interface UnifiedRuntimeConfig {
  statePort: GenerativeStatePort;
  generativeInterface: InterfaceHandle;
  cartInterface: InterfaceHandle;
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
  private buildConversationRequest: ReturnType<typeof createConversationRequestBuilder>;
  private surfaceProcessor: ReturnType<typeof createSurfaceProcessor>;

  private constructor(engine: FullEngine, _interfaceId: string, config: UnifiedRuntimeConfig) {
    this.engine = engine;
    this.statePort = config.statePort;
    this.buildConversationRequest = createConversationRequestBuilder(
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
      const agentInput = this.buildConversationRequest(this.engine, this.currentPrompt ?? '');
      const clientConfig = this.engine.read(this.configSelectors.getEndpointClientConfiguration);

      const client = createUnifiedEndpointClient();
      const result = await client.call(agentInput, clientConfig, {signal: abortController.signal});

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

    const deps = {
      statePort: this.statePort,
      ensureAgentResponse: (tid: string) => this.ensureAgentResponse(tid),
      onA2uiSurface: (tid: string, content: Record<string, unknown>) => {
        this.surfaceProcessor.processSnapshot(tid, content);
      },
    };

    await readEventStream({
      stream,
      signal,
      onEvent: (rawEvent: RawSSEEvent) => {
        const event = parseSSEEvent(rawEvent);
        const result = dispatchStreamEvent(activeTurnId, event, deps);
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

  private ensureAgentResponse(turnId: string): void {
    if (!this.agentResponseInitialized.has(turnId)) {
      this.statePort.initAgentResponse(turnId);
      this.agentResponseInitialized.add(turnId);
    }
  }
}
