import type {ChatState, ParsedEvent} from '../types/agent.js';

import {applyPatchToActivity} from './activityState.js';

export function applyParsedEventToChatState(
  state: ChatState,
  assistantMessageId: string,
  parsed: ParsedEvent
): ChatState {
  if (parsed.type === 'message' && parsed.content) {
    return {
      ...state,
      messages: state.messages.map((message) =>
        message.id === assistantMessageId
          ? {...message, content: `${message.content}${parsed.content}`}
          : message
      ),
    };
  }

  if (parsed.type === 'activity_snapshot' && parsed.activitySnapshot) {
    const snap = parsed.activitySnapshot;
    return {
      ...state,
      messages: state.messages.map((message) => {
        if (message.id !== assistantMessageId) {
          return message;
        }

        const existing = message.activities ?? [];
        const alreadyHas = existing.some(
          (activity) => activity.id === snap.messageId
        );
        const newActivities = alreadyHas
          ? existing.map((activity) =>
              activity.id === snap.messageId
                ? {...activity, content: snap.content}
                : activity
            )
          : [
              ...existing,
              {
                id: snap.messageId,
                activityType: snap.activityType,
                content: snap.content,
              },
            ];

        return {...message, activities: newActivities};
      }),
    };
  }

  if (parsed.type === 'activity_delta' && parsed.activityDelta) {
    const delta = parsed.activityDelta;
    return {
      ...state,
      messages: state.messages.map((message) => {
        if (message.id !== assistantMessageId) {
          return message;
        }

        return {
          ...message,
          activities: applyPatchToActivity(
            message.activities ?? [],
            delta.messageId,
            delta.patch
          ),
        };
      }),
    };
  }

  if (parsed.type === 'error') {
    return {
      ...state,
      error: parsed.error ?? 'Unknown error',
    };
  }

  return state;
}
