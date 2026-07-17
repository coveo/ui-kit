import type {
  GenerativeState,
  Turn,
} from '@/src/internal/features/generative/index.js';
import {GenerativeRuntime} from '@/src/internal/api/generative/index.js';
import {createHydrateSubInterface} from '@/src/internal/features/generative/index.js';
import {BaseController} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import {getOrCreateGenerativeActions} from '@/src/internal/features/generative/index.js';
import {getOrCreateGenerativeSelectors} from '@/src/internal/features/generative/index.js';
import type {GenerativeInterface} from '@/src/internal/utils/index.js';
import type {Controller} from '@/src/internal/utils/index.js';
import {
  SerializedConverseState,
  SerializedTurn,
} from './converse-controller-serialization.js';

class ConverseControllerImpl extends BaseController<ConverseControllerState> {
  #runtime: GenerativeRuntime;
  #actions: ReturnType<typeof getOrCreateGenerativeActions>;
  #selectors: ReturnType<typeof getOrCreateGenerativeSelectors>;

  constructor(options: ConverseControllerOptions) {
    const {engine: fullEngine, stateId} = getInterfaceInternals(
      options.interface
    );

    const actions = getOrCreateGenerativeActions(options.interface);
    const selectors = getOrCreateGenerativeSelectors(options.interface);

    if (options.conversationToRestore) {
      const hydratedState = hydrateFromSerializedState(
        options.conversationToRestore
      );
      fullEngine.mutate(actions.hydrateState(hydratedState));
    }

    const controllerState = createMemoizedStateSelector(
      selectors.getTurns,
      selectors.getActiveTurnId,
      (turns, activeTurnId): ConverseControllerState => ({
        turns,
        activeTurn: activeTurnId
          ? turns.find((t) => t.id === activeTurnId)
          : undefined,
        isStreaming: turns.some((t) => t.status === 'streaming'),
      })
    );

    super(fullEngine, controllerState);

    this.#actions = actions;
    this.#selectors = selectors;
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
        replaceTurnId: (oldId, newId) => {
          this.engine.mutate(this.#actions.replaceTurnId({oldId, newId}));
        },
        setRoutedInterface: (turnId, routedInterface) => {
          this.engine.mutate(
            this.#actions.setRoutedInterface({turnId, routedInterface})
          );
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
        appendSurface: (turnId, surface) => {
          this.engine.mutate(this.#actions.appendSurface({turnId, surface}));
          const ops = (surface as {operations?: unknown[]}).operations;
          if (Array.isArray(ops)) {
            options.onSurfaceOperation?.(ops);
          }
        },
        startToolCall: (turnId, toolCallId, toolName) => {
          this.engine.mutate(
            this.#actions.startToolCall({turnId, toolCallId, toolName})
          );
        },
        appendToolCallArgs: (turnId, toolCallId, delta) => {
          this.engine.mutate(
            this.#actions.appendToolCallArgs({turnId, toolCallId, delta})
          );
        },
        completeToolCall: (turnId, toolCallId, result) => {
          this.engine.mutate(
            this.#actions.completeToolCall({turnId, toolCallId, result})
          );
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
          this.engine.mutate(
            this.#actions.appendReasoningDelta({turnId, delta})
          );
        },
        endReasoning: (turnId) => {
          this.engine.mutate(this.#actions.endReasoning({turnId}));
        },
        setConversationSession: (sessionId, token) => {
          this.engine.mutate(
            this.#actions.setConversationSession({sessionId, token})
          );
        },
      },
      hydrateSubInterface: createHydrateSubInterface(fullEngine),
    });
  }

  serialize(): SerializedConverseState {
    const {turns, activeTurn} = this.state;

    const serializedTurns: SerializedTurn[] = turns.map((turn) => {
      const {routedInterface, ...rest} = turn;
      const serialized: SerializedTurn = {...rest};
      if (routedInterface) {
        serialized.routedInterface = {useCase: routedInterface.useCase};
      }
      return serialized;
    });

    const firstPrompt = turns.length > 0 ? turns[0].prompt : '';

    return {
      name: firstPrompt,
      timestamp: Date.now(),
      conversationSessionId: this.engine.read(
        this.#selectors.getConversationSessionId
      ),
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
}

export const buildConverseController = (
  options: ConverseControllerOptions
): ConverseController => new ConverseControllerImpl(options);

export interface ConverseController extends Controller<ConverseControllerState> {
  serialize(): SerializedConverseState;
  restore(state: SerializedConverseState): void;
  clear(): void;
  submit(options: {prompt: string}): void;
  selectTurn(options: {id: string}): void;
  retry(options: {id: string}): void;
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

function hydrateFromSerializedState(
  serialized: SerializedConverseState
): GenerativeState {
  const turns: Turn[] = serialized.turns.map((serializedTurn) => {
    const {routedInterface: _routedInterface, ...rest} = serializedTurn;
    const turn: Turn = {...rest};

    if (turn.status === 'streaming') {
      turn.status = 'error';
      turn.error = 'Stream was interrupted';
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
