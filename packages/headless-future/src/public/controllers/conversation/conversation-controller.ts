import type {
  ConversationMessage,
  ConversationSession,
  ConversationStreaming,
  ConversationTurn,
} from '@/src/core/interface/conversation/conversation-types.js';
import {ConversationRuntime} from '@/src/core/interface/api/conversation-endpoint/conversation-runtime.js';
import {loadConversation} from '@/src/core/interface/conversation/conversation-loader.js';
import {loadConversationEndpoint} from '@/src/core/interface/api/conversation-endpoint/conversation-endpoint-loader.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import type {
  Interface,
  Requires,
} from '@/src/core/interface/utils/interface-types.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateConversationActions} from '@/src/core/internal/conversation/conversation-actions.js';
import {getOrCreateConversationSelectors} from '@/src/core/internal/conversation/conversation-selectors.js';
import {getOrCreateConversationEndpointSelectors} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-selectors.js';
import {Controller} from '../controller-types.js';

/**
 * Conversation Controller
 *
 * Manages conversational turn submission, abortion, state access, and
 * subscriptions.
 */
export interface ConversationController extends Controller {
  /**
   * Submit a user message and stream the assistant response.
   *
   * @param input The user's message text.
   * @param options Optional continuity fields to force into the request before
   * the turn starts (useful for the first request when resuming a conversation).
   * @returns A promise that resolves when the turn lifecycle completes.
   */
  submitTurn(
    input: string,
    options?: ConversationControllerSubmitTurnOptions
  ): Promise<void>;

  /**
   * Abort the currently active turn.
   * Silent no-op if no turn is active.
   */
  abortTurn(): void;

  readonly state: ConversationControllerState;
}

export type ConversationControllerMessage = ConversationMessage;
export type ConversationControllerTurn = ConversationTurn;
export type ConversationControllerSession = ConversationSession;
export type ConversationControllerStreaming = ConversationStreaming;

export interface ConversationControllerState {
  messages: ConversationControllerMessage[];
  turns: ConversationControllerTurn[];
  activeTurnId: string | null;
  session: ConversationControllerSession;
  isLoading: boolean;
  error: string | null;
  streaming: ConversationControllerStreaming;
}

export interface ConversationControllerOptions {
  interface: Interface<'conversation'> & Requires<'conversation'>;
}

export interface ConversationControllerSubmitTurnOptions {
  /**
   * Optional explicit session id for the upcoming request.
   * Pass null to clear a previously stored value.
   */
  conversationSessionId?: string | null;

  /**
   * Optional explicit conversation token for the upcoming request.
   * Pass null to clear a previously stored value.
   */
  conversationToken?: string | null;
}

export const buildConversationController: (
  options: ConversationControllerOptions
) => ConversationController = (options) => {
  const fullEngine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

  loadConversation(fullEngine, stateId);
  loadConversationEndpoint(fullEngine, stateId);

  const actions = getOrCreateConversationActions(stateId);
  const selectors = getOrCreateConversationSelectors(stateId);
  const endpointSelectors = getOrCreateConversationEndpointSelectors(stateId);

  const runtime = ConversationRuntime.getInstance(fullEngine, stateId, {
    readSession: () => fullEngine.read(selectors.getSession),
    setSession: (session) => {
      fullEngine.mutate(actions.setSession(session));
    },
    patchSession: (sessionPatch) => {
      fullEngine.mutate(actions.patchSession(sessionPatch));
    },
    setError: (error) => {
      fullEngine.mutate(actions.setError(error));
    },
    startTurn: (payload) => {
      fullEngine.mutate(actions.startTurn(payload));
    },
    abortTurn: (payload) => {
      fullEngine.mutate(actions.abortTurn(payload));
    },
    appendAgentChunk: (payload) => {
      fullEngine.mutate(actions.appendAgentChunk(payload));
    },
    completeTurn: (payload) => {
      fullEngine.mutate(actions.completeTurn(payload));
    },
    failTurn: (payload) => {
      fullEngine.mutate(actions.failTurn(payload));
    },
  });

  const controllerState = createMemoizedStateSelector(
    selectors.getMessages,
    selectors.getTurns,
    selectors.getActiveTurnId,
    selectors.getSession,
    endpointSelectors.getIsLoading,
    endpointSelectors.getError,
    endpointSelectors.getStreaming,
    (
      messages,
      turns,
      activeTurnId,
      session,
      isLoading,
      error,
      streaming
    ): ConversationControllerState => ({
      messages,
      turns,
      activeTurnId,
      session,
      isLoading,
      error,
      streaming,
    })
  );

  return {
    submitTurn(input, options) {
      return options
        ? runtime.submitTurn(input, options)
        : runtime.submitTurn(input);
    },
    abortTurn() {
      runtime.abortTurn();
    },
    get state() {
      return fullEngine.read(controllerState);
    },
    subscribe(callback) {
      return fullEngine.subscribe(controllerState, callback);
    },
  };
};
