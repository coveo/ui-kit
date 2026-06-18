import type {Turn} from '@/src/core/interface/generative/generative-types.js';
import {GenerativeRuntime} from '@/src/core/interface/api/generative-endpoint/generative-runtime.js';
import {createHydrateSubInterface} from '@/src/core/interface/generative/generative-hydration.js';
import {loadGenerative} from '@/src/core/interface/generative/generative-loader.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {
  ENGINE,
  STATE_ID,
  SOURCE_ENGINE,
} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateGenerativeActions} from '@/src/core/internal/generative/generative-actions.js';
import {getOrCreateGenerativeSelectors} from '@/src/core/internal/generative/generative-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {Controller} from '../controller-types.js';

export interface ConverseController extends Controller {
  submit(options: {prompt: string}): void;
  selectTurn(options: {id: string}): void;
  retry(options: {id: string}): void;
  readonly state: ConverseControllerState;
  subscribe(callback: (state: ConverseControllerState) => void): () => void;
}

export interface ConverseControllerState {
  turns: Turn[];
  activeTurnId: string | undefined;
  activeTurn: Turn | undefined;
  isStreaming: boolean;
}

export interface ConverseControllerOptions {
  interface: GenerativeInterface;
}

export const buildConverseController = (
  options: ConverseControllerOptions
): ConverseController => {
  const fullEngine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const sourceEngine = options.interface[SOURCE_ENGINE];

  loadGenerative(fullEngine, stateId);

  const actions = getOrCreateGenerativeActions(stateId);
  const selectors = getOrCreateGenerativeSelectors(stateId);

  const runtime = GenerativeRuntime.getInstance(fullEngine, stateId, {
    generativeInterfaceId: stateId,
    cartInterfaceId: stateId,
    statePort: {
      createTurn(payload) {
        fullEngine.mutate(actions.createTurn(payload));
      },
      setActiveTurnId(id) {
        fullEngine.mutate(actions.setActiveTurnId(id));
      },
      replaceTurnId(oldId, newId) {
        fullEngine.mutate(actions.replaceTurnId({oldId, newId}));
      },
      setRoutedInterface(turnId, routedInterface) {
        fullEngine.mutate(
          actions.setRoutedInterface({turnId, routedInterface})
        );
      },
      initAgentResponse(turnId) {
        fullEngine.mutate(actions.initAgentResponse({turnId}));
      },
      startMessage(turnId, role) {
        fullEngine.mutate(actions.startMessage({turnId, role}));
      },
      appendMessageDelta(turnId, delta) {
        fullEngine.mutate(actions.appendMessageDelta({turnId, delta}));
      },
      appendSurface(turnId, surface) {
        fullEngine.mutate(actions.appendSurface({turnId, surface}));
      },
      startToolCall(turnId, toolCallId, toolName) {
        fullEngine.mutate(
          actions.startToolCall({turnId, toolCallId, toolName})
        );
      },
      appendToolCallArgs(turnId, toolCallId, delta) {
        fullEngine.mutate(
          actions.appendToolCallArgs({turnId, toolCallId, delta})
        );
      },
      completeToolCall(turnId, toolCallId, result) {
        fullEngine.mutate(
          actions.completeToolCall({turnId, toolCallId, result})
        );
      },
      completeTurn(turnId) {
        fullEngine.mutate(actions.completeTurn({turnId}));
      },
      failTurn(turnId, error) {
        fullEngine.mutate(actions.failTurn({turnId, error}));
      },
      clearTurnResponse(turnId) {
        fullEngine.mutate(actions.clearTurnResponse({turnId}));
      },
    },
    hydrateSubInterface: createHydrateSubInterface(sourceEngine),
  });

  const controllerState = createMemoizedStateSelector(
    selectors.getTurns,
    selectors.getActiveTurnId,
    (turns, activeTurnId): ConverseControllerState => ({
      turns,
      activeTurnId,
      activeTurn: activeTurnId
        ? turns.find((t) => t.id === activeTurnId)
        : undefined,
      isStreaming: turns.some((t) => t.status === 'streaming'),
    })
  );

  return {
    submit({prompt}) {
      if (!prompt.trim()) {
        return;
      }
      const currentState = fullEngine.read(controllerState);
      if (currentState.isStreaming) {
        return;
      }
      runtime.submit(prompt);
    },

    selectTurn({id}) {
      const turns = fullEngine.read(selectors.getTurns);
      if (turns.some((t) => t.id === id)) {
        fullEngine.mutate(actions.setActiveTurnId(id));
      }
    },

    retry({id}) {
      const turns = fullEngine.read(selectors.getTurns);
      const turn = turns.find((t) => t.id === id);
      if (!turn || turn.status !== 'error') {
        return;
      }
      runtime.resubmit(id, turn.prompt);
    },

    get state() {
      return fullEngine.read(controllerState);
    },

    subscribe(callback) {
      return fullEngine.subscribe(controllerState, callback);
    },
  };
};
