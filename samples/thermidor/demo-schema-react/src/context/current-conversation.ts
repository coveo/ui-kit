import type {SerializedSession} from '@coveo/thermidor';

const CURRENT_CONVERSATION_KEY = 'demo-current-conversation';

/** The tab's current conversation, and whether it is only shown. */
export interface CurrentConversation {
  session: SerializedSession;
  readOnly: boolean;
}

/**
 * The tab's current conversation, kept in `sessionStorage` so a page reload picks it back up.
 * Whether its version can be restored is left to `createSession`.
 */
export function readCurrentConversation(): CurrentConversation | undefined {
  const kept = sessionStorage.getItem(CURRENT_CONVERSATION_KEY);
  if (kept === null) {
    return undefined;
  }
  try {
    return JSON.parse(kept) as CurrentConversation;
  } catch {
    return undefined;
  }
}

export function keepCurrentConversation(conversation: CurrentConversation): void {
  sessionStorage.setItem(CURRENT_CONVERSATION_KEY, JSON.stringify(conversation));
}

export function forgetCurrentConversation(): void {
  sessionStorage.removeItem(CURRENT_CONVERSATION_KEY);
}
