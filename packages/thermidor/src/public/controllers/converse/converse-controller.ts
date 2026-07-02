import type {Turn} from '@/src/core/interface/generative/generative-types.js';
import {GenerativeRuntime} from '@/src/core/interface/api/generative-endpoint/generative-runtime.js';
import {loadGenerative} from '@/src/core/interface/generative/generative-loader.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateGenerativeActions} from '@/src/core/internal/generative/generative-actions.js';
import {getOrCreateGenerativeSelectors} from '@/src/core/internal/generative/generative-selectors.js';
import {getOrCreateBackendInterfacesActions} from '@/src/core/internal/backend-interfaces/backend-interfaces-actions.js';
import {getOrCreateBackendInterfacesSlice} from '@/src/core/internal/backend-interfaces/backend-interfaces-slice.js';
import type {
  BackendSuggestionsEntry,
  BackendFacetSearchEntry,
} from '@/src/core/internal/backend-interfaces/backend-interfaces-actions.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {Controller} from '../controller-types.js';

export type BackendInterfaceAction =
  | {type: 'execute_search'; query: string}
  | {type: 'toggle_facet'; interfaceId: string; facetId: string; value: string}
  | {
      type: 'toggle_exclude_facet';
      interfaceId: string;
      facetId: string;
      value: string;
    }
  | {type: 'deselect_all_facets'; interfaceId: string; facetId: string}
  | {type: 'select_page'; interfaceId: string; page: number}
  | {type: 'set_page_size'; interfaceId: string; pageSize: number}
  | {
      type: 'set_sort';
      interfaceId: string;
      sortCriteria: string;
      fields?: Array<{field: string; direction: string}>;
    }
  | {type: 'fetch_suggestions'; interfaceId: string; query: string}
  | {type: 'facet_search'; interfaceId: string; facetId: string; query: string}
  | {
      type: 'toggle_numeric_facet';
      interfaceId: string;
      facetId: string;
      start: number;
      end: number;
      endInclusive: boolean;
    }
  | {
      type: 'set_numeric_facet_range';
      interfaceId: string;
      facetId: string;
      start: number;
      end: number;
      endInclusive: boolean;
    }
  | {
      type: 'product_click';
      interfaceId: string;
      productId: string;
      name: string;
      price: number;
      position: number;
    }
  | {
      type: 'product_view';
      interfaceId: string;
      productId: string;
      name: string;
      price: number;
    }
  | {
      type: 'purchase';
      products: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
      }>;
      transaction: {id: string; revenue: number};
    }
  | {
      type: 'restore_state';
      interfaceId: string;
      query?: string;
      facets?: unknown[];
      page?: number;
      pageSize?: number;
      sort?: unknown;
    }
  | {
      type: 'cart_action';
      productId: string;
      name: string;
      price: number;
      quantity: number;
      action: 'add' | 'remove';
    }
  | {type: 'select_products'; interfaceId: string; productIds: string[]};

export interface ConverseController extends Controller<ConverseControllerState> {
  submit(options: {prompt: string}): void;
  sendAction(action: BackendInterfaceAction): void;
  selectTurn(options: {id: string}): void;
  retry(options: {id: string}): void;
  restoreSession(sessionId: string, token: string): void;
}

export interface ConverseControllerState {
  turns: Turn[];
  activeTurnId: string | undefined;
  activeTurn: Turn | undefined;
  isStreaming: boolean;
  conversationSessionId: string | undefined;
  conversationToken: string | undefined;
}

export interface ConverseControllerOptions {
  interface: GenerativeInterface;
}

export const buildConverseController = (
  options: ConverseControllerOptions
): ConverseController => {
  const fullEngine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

  loadGenerative(fullEngine, stateId);
  fullEngine.adoptSlice(getOrCreateBackendInterfacesSlice(stateId));

  const actions = getOrCreateGenerativeActions(stateId);
  const selectors = getOrCreateGenerativeSelectors(stateId);
  const biActions = getOrCreateBackendInterfacesActions(stateId);

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
      createBackendInterface(interfaceId, type, display, state) {
        fullEngine.mutate(
          biActions.createInterface({
            interfaceId,
            type,
            display: display as 'main' | 'inline',
            state,
          })
        );
      },
      updateBackendInterfaceState(interfaceId, state, display) {
        fullEngine.mutate(
          biActions.updateInterfaceState({
            interfaceId,
            state,
            display: display as 'main' | 'inline' | undefined,
          })
        );
      },
      updateSuggestions(interfaceId, suggestions) {
        fullEngine.mutate(
          biActions.setSuggestions({
            interfaceId,
            suggestions: suggestions as BackendSuggestionsEntry,
          })
        );
      },
      setConversationSessionId(sessionId) {
        fullEngine.mutate(actions.setConversationSessionId(sessionId));
      },
      setConversationToken(token) {
        fullEngine.mutate(actions.setConversationToken(token));
      },
      updateFacetSearchResults(interfaceId, results) {
        fullEngine.mutate(
          biActions.setFacetSearchResults({
            interfaceId,
            results: results as unknown as BackendFacetSearchEntry,
          })
        );
      },
    },
  });

  const controllerState = createMemoizedStateSelector(
    selectors.getTurns,
    selectors.getActiveTurnId,
    selectors.getConversationSessionId,
    selectors.getConversationToken,
    (
      turns,
      activeTurnId,
      conversationSessionId,
      conversationToken
    ): ConverseControllerState => ({
      turns,
      activeTurnId,
      activeTurn: activeTurnId
        ? turns.find((t) => t.id === activeTurnId)
        : undefined,
      isStreaming: turns.some((t) => t.status === 'streaming'),
      conversationSessionId,
      conversationToken,
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

    sendAction(action) {
      const currentState = fullEngine.read(controllerState);
      if (currentState.isStreaming) {
        return;
      }
      runtime.submitAction(action as unknown as Record<string, unknown>);
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

    restoreSession(sessionId, token) {
      runtime.restoreSession(sessionId, token);
    },

    get state() {
      return fullEngine.read(controllerState);
    },

    subscribe(callback) {
      return fullEngine.subscribe(controllerState, callback);
    },
  };
};
