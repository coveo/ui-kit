import type {ActivityMessage, Message} from '../types/agent.js';

export function buildInvocationMessages(messages: Message[]): Message[] {
  return messages
    .map((message) => {
      if (message.role === 'user') {
        return message;
      }

      const trimmed = message.content.trim();
      const activities = message.activities ?? [];

      if (trimmed && activities.length > 0) {
        // Include both text and activity data so the agent keeps full context.
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

function summarizeActivities(activities: ActivityMessage[]): string {
  const serialized = activities
    .map((activity) => {
      const compactContent = JSON.stringify(activity.content);
      return `${activity.activityType}:${compactContent}`;
    })
    .join(' | ');

  // Keep the history payload bounded while still retaining useful context.
  return serialized.length > 2500
    ? `${serialized.slice(0, 2500)}...`
    : serialized;
}
