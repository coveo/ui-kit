import type {Controller} from '../../controller/headless-controller.js';
import {buildController} from '../../controller/headless-controller.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {loadReducerError} from '../../../utils/errors.js';
import {createCommerceAgentRunner} from '../../../api/commerce/agent/commerce-agent-runner.js';
import type {CommerceAgentOptions} from '../../../api/commerce/agent/commerce-agent.js';
import {agentChatReducer} from '../../../features/commerce/agent-chat/agent-chat-slice.js';
import type {
  AgentChatActivity,
  AgentChatError,
  AgentChatMessage,
  AgentChatProgress,
  AgentChatState,
} from '../../../features/commerce/agent-chat/agent-chat-state.js';
import {
  selectAgentChatError,
  selectAgentChatIsStreaming,
  selectAgentChatMessages,
  selectAgentChatStreamingProgress,
  selectAgentChatThreadId,
  selectAgentChatThreadState,
} from '../../../features/commerce/agent-chat/agent-chat-selectors.js';
import {
  applyClientActivityPatch as applyClientPatchAction,
  clearConversation,
  dismissAgentChatError,
  handoffActivityToClient as handoffAction,
} from '../../../features/commerce/agent-chat/agent-chat-actions.js';

export type {
  AgentChatActivity,
  AgentChatError,
  AgentChatMessage,
  AgentChatProgress,
};

export interface AgentChatControllerState {
  messages: AgentChatMessage[];
  isStreaming: boolean;
  progress: AgentChatProgress;
  error: AgentChatError | null;
  threadId: string;
}

/**
 * The `AgentChat` controller manages a conversational interface
 * with a Coveo Commerce agent, handling message streaming,
 * activity data bindings, and thread state synchronization.
 *
 * @group Controllers
 */
export interface AgentChat extends Controller {
  /**
   * Sends a user message to the agent and begins streaming the response.
   * If a stream is already active, aborts the previous one.
   */
  sendMessage(content: string): void;

  /**
   * Clears all messages and resets the conversation state.
   */
  clearConversation(): void;

  /**
   * Dismisses the current error, if any.
   */
  dismissError(): void;

  /**
   * Transfers ownership of an activity to the client,
   * allowing client-side mutations via `applyClientActivityPatch`.
   */
  handoffActivityToClient(activityId: string): void;

  /**
   * Applies a JSON Patch to a client-owned activity's data.
   * Only succeeds if the activity has been handed off to the client.
   */
  applyClientActivityPatch(activityId: string, patch: unknown[]): void;

  /**
   * The current state of the agent chat controller.
   */
  state: AgentChatControllerState;
}

/**
 * Creates an `AgentChat` controller instance.
 *
 * @param engine - The commerce engine instance.
 * @param props - The agent chat controller options.
 * @returns An `AgentChat` controller instance.
 *
 * @group Controllers
 */
export function buildAgentChat(engine: CommerceEngine): AgentChat {
  if (!loadAgentChatReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () =>
    engine[stateKey] as unknown as {
      agentChat: AgentChatState;
      commerceContext: {
        language: string;
        country: string;
        currency: string;
        view: {url: string};
      };
    };
  const config = engine.configuration;

  const contextState = getState().commerceContext;

  const agentOptions: CommerceAgentOptions = {
    accessToken: config.accessToken,
    organizationId: config.organizationId,
    environment: config.environment,
    trackingId: config.analytics?.trackingId,
    language: contextState.language,
    country: contextState.country,
    currency: contextState.currency,
    clientId: config.analytics?.trackingId,
    contextUrl: contextState.view?.url,
  };

  const runner = createCommerceAgentRunner(agentOptions);

  return {
    ...controller,

    get state(): AgentChatControllerState {
      const state = getState();
      const isStreaming = selectAgentChatIsStreaming(state);
      const messages = selectAgentChatMessages(state);

      // During streaming, show live progress; otherwise show last message's progress
      let progress = selectAgentChatStreamingProgress(state);
      if (!isStreaming && messages.length > 0) {
        const lastAssistant = [...messages]
          .reverse()
          .find((m) => m.role === 'assistant');
        if (lastAssistant?.progress) {
          progress = lastAssistant.progress;
        }
      }

      return {
        messages,
        isStreaming,
        progress,
        error: selectAgentChatError(state),
        threadId: selectAgentChatThreadId(state),
      };
    },

    sendMessage(content: string) {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }

      const state = getState();
      if (selectAgentChatIsStreaming(state)) {
        return;
      }

      const messages = selectAgentChatMessages(state);
      const threadId = selectAgentChatThreadId(state);
      const threadState = selectAgentChatThreadState(state);

      void runner.run(dispatch, trimmed, messages, threadId, threadState);
    },

    clearConversation() {
      runner.abortRun();
      dispatch(clearConversation({threadId: generateThreadId()}));
    },

    dismissError() {
      dispatch(dismissAgentChatError());
    },

    handoffActivityToClient(activityId: string) {
      dispatch(handoffAction({activityId}));
    },

    applyClientActivityPatch(activityId: string, patch: unknown[]) {
      dispatch(applyClientPatchAction({activityId, patch}));
    },
  };
}

function loadAgentChatReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({agentChat: agentChatReducer});
  return true;
}

function generateThreadId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `thread-${crypto.randomUUID()}`;
  }
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
