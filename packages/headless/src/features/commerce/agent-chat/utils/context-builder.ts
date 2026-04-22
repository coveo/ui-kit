import type {AgentChatMessage} from '../agent-chat-state.js';

const MAX_CONTEXT_LENGTH = 2500;

/**
 * Builds the list of messages to send when invoking the agent.
 * Enriches assistant messages with activity context so the agent
 * retains awareness of prior tool outputs.
 */
export function buildInvocationMessages(
  messages: AgentChatMessage[]
): AgentChatMessage[] {
  return messages
    .map((message) => {
      if (message.role === 'user') {
        return message;
      }

      const trimmed = message.content.trim();
      const activities = message.activities ?? [];

      if (trimmed && activities.length > 0) {
        return {
          ...message,
          content: `${trimmed}\n\n[Activity context: ${summarizeActivities(activities)}]`,
        };
      }

      if (trimmed) {
        return {...message, content: trimmed};
      }

      if (activities.length > 0) {
        return {
          ...message,
          content: `Activity context: ${summarizeActivities(activities)}`,
        };
      }

      return message;
    })
    .filter(
      (message) => message.role === 'user' || message.content.trim().length > 0
    );
}

function summarizeActivities(
  activities: AgentChatMessage['activities']
): string {
  if (!activities || activities.length === 0) {
    return '';
  }

  const serialized = activities
    .map((activity) => {
      const compactContent = JSON.stringify(activity.data);
      return `${activity.type}:${compactContent}`;
    })
    .join(' | ');

  return serialized.length > MAX_CONTEXT_LENGTH
    ? `${serialized.slice(0, MAX_CONTEXT_LENGTH)}...`
    : serialized;
}
