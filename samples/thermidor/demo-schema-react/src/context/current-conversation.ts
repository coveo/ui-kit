import type {SerializedSession} from '@coveo/thermidor';

const CURRENT_CONVERSATION_KEY = 'demo-current-conversation';

/**
 * The tab's current conversation, kept in `sessionStorage` so a page reload picks it back up.
 * Whether its version can be restored is left to `createSession`.
 */
export function readCurrentConversation(): SerializedSession | undefined {
  const kept = sessionStorage.getItem(CURRENT_CONVERSATION_KEY);
  if (kept === null) {
    return undefined;
  }
  try {
    return JSON.parse(kept) as SerializedSession;
  } catch {
    return undefined;
  }
}

export function keepCurrentConversation(conversation: SerializedSession): void {
  sessionStorage.setItem(CURRENT_CONVERSATION_KEY, JSON.stringify(conversation));
}

export function forgetCurrentConversation(): void {
  sessionStorage.removeItem(CURRENT_CONVERSATION_KEY);
}
