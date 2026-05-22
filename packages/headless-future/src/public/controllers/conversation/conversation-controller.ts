import type {
  ConversationMessage,
  ConversationSession,
  ConversationStreaming,
  ConversationTurn,
} from '@/src/core/index.js';
import {
  ConversationRuntime,
  conversationEndpointSelectors,
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
   * @returns A promise that resolves when the turn lifecycle completes.
   */
  submitTurn(input: string): Promise<void>;

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

  const runtime = ConversationRuntime.getInstance(fullEngine);
  const stateSelect = buildStateSelector();

  return {
    submitTurn(input) {
      return runtime.submitTurn(input);
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
