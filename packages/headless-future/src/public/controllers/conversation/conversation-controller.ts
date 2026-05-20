import type {
  ConversationMessage,
  ConversationSession,
  ConversationStreaming,
  ConversationTurn,
} from '@/src/core/interface/conversation/conversation-types.js';
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

export declare const buildConversationController: (
  options: ConversationControllerOptions
) => ConversationController;
