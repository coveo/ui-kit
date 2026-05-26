import type {
  ConversationMessage,
  ConversationSession,
  ConversationStreaming,
  ConversationTurn,
} from '@/src/core/index.js';
import {
  ConversationRuntime,
  conversationEndpointSelectors,
  conversationMutators,
  conversationSelectors,
  createMemoizedStateSelector,
  getFullEngine,
  loadConversation,
  loadConversationEndpoint,
} from '@/src/core/index.js';
import {Controller, ControllerOptions} from '../controller-types.js';

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

export interface ConversationControllerOptions extends ControllerOptions {}

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

type ConversationSelectionState = Parameters<
  typeof conversationSelectors.messages
>[0] &
  Parameters<typeof conversationEndpointSelectors.isLoading>[0];

const buildStateSelector = () => {
  return createMemoizedStateSelector<
    ConversationSelectionState,
    [
      ConversationControllerMessage[],
      ConversationControllerTurn[],
      string | null,
      ConversationControllerSession,
      boolean,
      string | null,
      ConversationControllerStreaming,
    ],
    ConversationControllerState
  >(
    [
      (state) => conversationSelectors.messages(state),
      (state) => conversationSelectors.turns(state),
      (state) => conversationSelectors.activeTurnId(state),
      (state) => conversationSelectors.session(state),
      (state) => conversationEndpointSelectors.isLoading(state),
      (state) => conversationEndpointSelectors.error(state),
      (state) => conversationEndpointSelectors.streaming(state),
    ],
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
};

export const buildConversationController: (
  options: ConversationControllerOptions
) => ConversationController = (options) => {
  const fullEngine = getFullEngine(options.engine);
  loadConversation(fullEngine);
  loadConversationEndpoint(fullEngine);

  const runtime = ConversationRuntime.getInstance(fullEngine, {
    readSession: () => fullEngine.read(conversationSelectors.session),
    setSession: (session) => {
      fullEngine.mutate(conversationMutators.setSession(session));
    },
    patchSession: (sessionPatch) => {
      fullEngine.mutate(conversationMutators.patchSession(sessionPatch));
    },
    setError: (error) => {
      fullEngine.mutate(conversationMutators.setError(error));
    },
    startTurn: (payload) => {
      fullEngine.mutate(conversationMutators.startTurn(payload));
    },
    abortTurn: (payload) => {
      fullEngine.mutate(conversationMutators.abortTurn(payload));
    },
    appendAgentChunk: (payload) => {
      fullEngine.mutate(conversationMutators.appendAgentChunk(payload));
    },
    completeTurn: (payload) => {
      fullEngine.mutate(conversationMutators.completeTurn(payload));
    },
    failTurn: (payload) => {
      fullEngine.mutate(conversationMutators.failTurn(payload));
    },
  });
  const stateSelect = buildStateSelector();

  return {
    submitTurn(input, options) {
      return options
        ? runtime.submitTurn(input, options)
        : runtime.submitTurn(input);
    },
    abortTurn() {
      runtime.abortTurn();
    },
    subscribe(callback) {
      return fullEngine.subscribe(stateSelect, callback);
    },
    get state() {
      return fullEngine.read(stateSelect);
    },
  };
};
