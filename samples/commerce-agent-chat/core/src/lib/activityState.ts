import type {ActivityMessage} from '../types/agent.js';

import {applyJsonPatch} from './jsonPatch.js';

export function applyPatchToActivity(
  activities: ActivityMessage[],
  messageId: string,
  patch: unknown[]
): ActivityMessage[] {
  return activities.map((activity) =>
    activity.id === messageId
      ? {...activity, content: applyJsonPatch(activity.content, patch)}
      : activity
  );
}
