import type {GenerativeState, StateTurn, Turn} from '@/src/internal/features/generative/index.js';
import {UnifiedRuntime} from '@/src/internal/api/unified/index.js';
import {
  getOrCreateRoutedInterfaceRegistry,
  mergeTurnsWithRegistry,
} from '@/src/internal/features/generative/index.js';
import {BaseController} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import {getOrCreateGenerativeActions} from '@/src/internal/features/generative/index.js';
import {getOrCreateGenerativeSelectors} from '@/src/internal/features/generative/index.js';
import type {GenerativeUnifiedInterface} from '@/src/internal/utils/index.js';
import type {Controller} from '@/src/internal/utils/index.js';
import {
  SerializedConverseState,
  SerializedTurn,
} from '../converse/converse-controller-serialization.js';

class UnifiedConverseControllerImpl extends BaseController<UnifiedConverseControllerState> {
  #runtime: UnifiedRuntime;
  #actions: ReturnType<typeof getOrCreateGenerativeActions>;
  #selectors: ReturnType<typeof getOrCreateGenerativeSelectors>;
  #generativeInterface: GenerativeUnifiedInterface;

  constructor(options: UnifiedConverseControllerOptions) {
    const {engine: fullEngine, stateId} = getInterfaceInternals(options.interface);

    const actions = getOrCreateGenerativeActions(options.interface);
    const selectors = getOrCreateGenerativeSelectors(options.interface);

    if (options.conversationToRestore) {
      const hydratedState = hydrateFromSerializedState(options.conversationToRestore);
      fullEngine.mutate(actions.hydrateState(hydratedState));
    }

    const registry = getOrCreateRoutedInterfaceRegistry(options.interface);

    const controllerState = createMemoizedStateSelector(
      selectors.getTurns,
      selectors.getActiveTurnId,
      (stateTurns, activeTurnId): UnifiedConverseControllerState => {
        const turns = mergeTurnsWithRegistry(stateTurns, registry);
        return {
          turns,
          activeTurn: activeTurnId ? turns.find((t) => t.id === activeTurnId) : undefined,
          isStreaming: turns.some((t) => t.status === 'streaming'),
        };
      }
    );

    super(fullEngine, controllerState);

    this.#actions = actions;
    this.#selectors = selectors;
    this.#generativeInterface = options.interface;
    this.#runtime = UnifiedRuntime.getInstance(fullEngine, stateId, {
      generativeInterface: options.interface,
      cartInterface: options.interface,
      statePort: {
        createTurn: (payload) => {
          this.engine.mutate(this.#actions.createTurn(payload));
        },
        setActiveTurnId: (id) => {
          this.engine.mutate(this.#actions.setActiveTurnId(id));
        },
        getActiveTurnId: () => {
          return this.engine.read(this.#selectors.getActiveTurnId);
        },
        replaceTurnId: (oldId, newId) => {
          this.engine.mutate(this.#actions.replaceTurnId({oldId, newId}));
        },
        setRoutedInterface: (turnId, hydrationResult) => {
          const registry = getOrCreateRoutedInterfaceRegistry(options.interface);
          registry.register(turnId, {
            useCase: hydrationResult.useCase,
            interface: hydrationResult.interface,
            snapshot: hydrationResult.snapshot,
            query: hydrationResult.query,
            surfaceId: hydrationResult.surfaceId,
          });
          this.engine.mutate(
            this.#actions.setRoutedInterface({turnId, useCase: hydrationResult.useCase})
          );
        },
        clearRoutedInterface: (turnId, surfaceId) => {
          const registry = getOrCreateRoutedInterfaceRegistry(options.interface);
          if (registry.get(turnId)?.surfaceId === surfaceId) {
            registry.remove(turnId);
            this.engine.mutate(this.#actions.clearRoutedInterface({turnId}));
          }
        },
        initAgentResponse: (turnId) => {
          this.engine.mutate(this.#actions.initAgentResponse({turnId}));
        },
        startMessage: (turnId, role) => {
          this.engine.mutate(this.#actions.startMessage({turnId, role}));
        },
        appendMessageDelta: (turnId, delta) => {
          this.engine.mutate(this.#actions.appendMessageDelta({turnId, delta}));
        },
        appendSurface: (turnId, surface, activity) => {
          this.engine.mutate(this.#actions.appendSurface({turnId, surface, activity}));
          const messages = (surface as {messages?: unknown[]}).messages;
          if (Array.isArray(messages)) {
            options.onSurfaceOperation?.(messages);
          }
        },
        appendActivity: (turnId, activity) => {
          this.engine.mutate(this.#actions.appendActivity({turnId, activity}));
        },
        setStateSnapshot: (turnId, state) => {
          this.engine.mutate(this.#actions.setStateSnapshot({turnId, state}));
        },
        startToolCall: (turnId, toolCallId, toolName) => {
          this.engine.mutate(this.#actions.startToolCall({turnId, toolCallId, toolName}));
        },
        appendToolCallArgs: (turnId, toolCallId, delta) => {
          this.engine.mutate(this.#actions.appendToolCallArgs({turnId, toolCallId, delta}));
        },
        completeToolCall: (turnId, toolCallId, result) => {
          this.engine.mutate(this.#actions.completeToolCall({turnId, toolCallId, result}));
        },
        completeTurn: (turnId) => {
          this.engine.mutate(this.#actions.completeTurn({turnId}));
        },
        failTurn: (turnId, error) => {
          this.engine.mutate(this.#actions.failTurn({turnId, error}));
        },
        clearTurnResponse: (turnId) => {
          this.engine.mutate(this.#actions.clearTurnResponse({turnId}));
        },
        startReasoning: (turnId) => {
          this.engine.mutate(this.#actions.startReasoning({turnId}));
        },
        appendReasoningDelta: (turnId, delta) => {
          this.engine.mutate(this.#actions.appendReasoningDelta({turnId, delta}));
        },
        endReasoning: (turnId) => {
          this.engine.mutate(this.#actions.endReasoning({turnId}));
        },
        setConversationSession: (sessionId, token) => {
          this.engine.mutate(this.#actions.setConversationSession({sessionId, token}));
        },
      },
    });
  }

  serialize(): SerializedConverseState {
    const {turns, activeTurn} = this.state;
    const registry = getOrCreateRoutedInterfaceRegistry(this.#generativeInterface);

    const serializedTurns: SerializedTurn[] = turns.map((turn) => {
      const {routedInterface, ...rest} = turn;
      const serialized: SerializedTurn = {...rest};
      if (routedInterface) {
        const entry = registry.get(turn.id);
        serialized.routedInterface = {
          useCase: routedInterface.useCase,
          snapshot: entry?.snapshot ?? {},
          query: entry?.query,
        };
      }
      return serialized;
    });

    const firstPrompt = turns.length > 0 ? turns[0].prompt : '';

    return {
      name: firstPrompt,
      timestamp: Date.now(),
      conversationSessionId: this.engine.read(this.#selectors.getConversationSessionId),
      conversationToken: this.engine.read(this.#selectors.getConversationToken),
      turns: serializedTurns,
      activeTurnId: activeTurn?.id,
    };
  }

  restore(state: SerializedConverseState): void {
    const hydratedState = hydrateFromSerializedState(state);
    this.engine.mutate(this.#actions.hydrateState(hydratedState));
  }

  clear(): void {
    this.engine.mutate(
      this.#actions.hydrateState({
        turns: [],
        activeTurnId: undefined,
        conversationSessionId: undefined,
        conversationToken: undefined,
      })
    );
  }

  submit({prompt}: {prompt: string}): void {
    if (!prompt.trim()) {
      return;
    }
    if (this.state.isStreaming) {
      return;
    }
    this.#runtime.submit(prompt);
  }

  cancel(): void {
    this.#runtime.cancel();
  }

  selectTurn({id}: {id: string}): void {
    const turns = this.engine.read(this.#selectors.getTurns);
    if (turns.some((t) => t.id === id)) {
      this.engine.mutate(this.#actions.setActiveTurnId(id));
    }
  }

  retry({id}: {id: string}): void {
    const turns = this.engine.read(this.#selectors.getTurns);
    const turn = turns.find((t) => t.id === id);
    if (!turn || turn.status !== 'error') {
      return;
    }
    this.#runtime.resubmit(id, turn.prompt);
  }
}

export const buildUnifiedConverseController = (
  options: UnifiedConverseControllerOptions
): UnifiedConverseController => new UnifiedConverseControllerImpl(options);

export interface UnifiedConverseController extends Controller<UnifiedConverseControllerState> {
  serialize(): SerializedConverseState;
  restore(state: SerializedConverseState): void;
  clear(): void;
  submit(options: {prompt: string}): void;
  cancel(): void;
  selectTurn(options: {id: string}): void;
  retry(options: {id: string}): void;
}

export interface UnifiedConverseControllerState {
  turns: Turn[];
  activeTurn: Turn | undefined;
  isStreaming: boolean;
}

export interface UnifiedConverseControllerOptions {
  interface: GenerativeUnifiedInterface;
  conversationToRestore?: SerializedConverseState;
  onSurfaceOperation?: (operations: unknown[]) => void;
}

function hydrateFromSerializedState(serialized: SerializedConverseState): GenerativeState {
  const turns: StateTurn[] = serialized.turns.map((serializedTurn) => {
    const {routedInterface, ...rest} = serializedTurn;
    const turn: StateTurn = {...rest};

    if (turn.status === 'streaming') {
      turn.status = 'error';
      turn.error = 'Stream was interrupted';
    }

    if (
      routedInterface &&
      (routedInterface.useCase === 'commerceSearch' || routedInterface.useCase === 'search')
    ) {
      turn.routedInterface = {useCase: routedInterface.useCase};
    }

    return turn;
  });

  return {
    turns,
    activeTurnId: serialized.activeTurnId,
    conversationSessionId: serialized.conversationSessionId,
    conversationToken: serialized.conversationToken,
  };
}
