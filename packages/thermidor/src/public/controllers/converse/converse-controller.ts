import type {GenerativeState, StateTurn, Turn} from '@/src/internal/features/generative/index.js';
import {GenerativeRuntime} from '@/src/internal/api/generative/index.js';
import {
  createHydrateSubInterface,
  getOrCreateRoutedInterfaceRegistry,
  mergeTurnsWithRegistry,
} from '@/src/internal/features/generative/index.js';
import {BaseController} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import {getOrCreateGenerativeActions} from '@/src/internal/features/generative/index.js';
import {getOrCreateGenerativeSelectors} from '@/src/internal/features/generative/index.js';
import type {GenerativeInterface} from '@/src/internal/utils/index.js';
import type {Controller} from '@/src/internal/utils/index.js';
import {SerializedConverseState, SerializedTurn} from './converse-controller-serialization.js';
import type {RemoteControllerAction} from '../remote/remote-controller.js';

class ConverseControllerImpl extends BaseController<ConverseControllerState> {
  #runtime: GenerativeRuntime;
  #actions: ReturnType<typeof getOrCreateGenerativeActions>;
  #selectors: ReturnType<typeof getOrCreateGenerativeSelectors>;
  #generativeInterface: GenerativeInterface;

  constructor(options: ConverseControllerOptions) {
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
      (stateTurns, activeTurnId): ConverseControllerState => {
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
    this.#runtime = GenerativeRuntime.getInstance(fullEngine, stateId, {
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
          if (hydrationResult.useCase === 'decomposedCommerceSearch') {
            this.engine.mutate(
              this.#actions.setRoutedInterface({
                turnId,
                useCase: 'decomposedCommerceSearch',
                surfaceType: hydrationResult.surfaceType,
                surfaceId: hydrationResult.surfaceId,
              })
            );
            return;
          }
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
      hydrateSubInterface: createHydrateSubInterface(fullEngine, options.interface),
    });
  }

  serialize(): SerializedConverseState {
    const {turns, activeTurn} = this.state;
    const registry = getOrCreateRoutedInterfaceRegistry(this.#generativeInterface);

    const serializedTurns: SerializedTurn[] = turns.map((turn) => {
      const {routedInterface, ...rest} = turn;
      const serialized: SerializedTurn = {...rest};
      if (routedInterface) {
        if (routedInterface.useCase === 'decomposedCommerceSearch') {
          serialized.routedInterface = {
            useCase: routedInterface.useCase,
            surfaceType: routedInterface.surfaceType,
            surfaceId: routedInterface.surfaceId,
            snapshot: {},
            query: undefined,
          };
        } else {
          const entry = registry.get(turn.id);
          serialized.routedInterface = {
            useCase: routedInterface.useCase,
            snapshot: entry?.snapshot ?? {},
            query: entry?.query,
          };
        }
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

  dispatchAction(action: RemoteControllerAction): Promise<void> {
    return this.#runtime.dispatchAction(action);
  }
}

export const buildConverseController = (options: ConverseControllerOptions): ConverseController =>
  new ConverseControllerImpl(options);

export interface ConverseController extends Controller<ConverseControllerState> {
  serialize(): SerializedConverseState;
  restore(state: SerializedConverseState): void;
  clear(): void;
  submit(options: {prompt: string}): void;
  selectTurn(options: {id: string}): void;
  retry(options: {id: string}): void;
  /** Sends a schema-derived remote controller action to the AG-UI gateway. */
  dispatchAction(action: RemoteControllerAction): Promise<void>;
}

export interface ConverseControllerState {
  turns: Turn[];
  activeTurn: Turn | undefined;
  isStreaming: boolean;
}

export interface ConverseControllerOptions {
  interface: GenerativeInterface;
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

    if (routedInterface) {
      if (routedInterface.useCase === 'decomposedCommerceSearch') {
        turn.routedInterface = {
          useCase: 'decomposedCommerceSearch',
          surfaceType: routedInterface.surfaceType ?? '',
          surfaceId: routedInterface.surfaceId ?? '',
        };
      } else if (
        routedInterface.useCase === 'commerceSearch' ||
        routedInterface.useCase === 'search'
      ) {
        turn.routedInterface = {useCase: routedInterface.useCase};
      }
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
