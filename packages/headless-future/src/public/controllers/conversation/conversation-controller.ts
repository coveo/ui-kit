import type {Engine} from '@/src/core/interface/engine/engine.js';
import type {Unsubscribe} from '@/src/core/interface/interface-types.js';
import type {ConversationControllerState} from '@/src/core/interface/conversation/conversation-types.js';

export type {ConversationControllerState};

/**
 * Conversation Controller
 *
 * Manages conversational turn submission, abortion, state access, and
 * subscriptions.
 */
export interface ConversationController {
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

  /**
   * Current conversation state including messages, turns, session, and
   * telemetry.
   */
  readonly state: ConversationControllerState;

  /**
   * Subscribe to state changes.
   *
   * @param callback Invoked whenever state changes.
   * @returns Unsubscribe function.
   */
  subscribe(callback: () => void): Unsubscribe;
}

export declare const buildConversationController: (
  engine: Engine
) => ConversationController;
