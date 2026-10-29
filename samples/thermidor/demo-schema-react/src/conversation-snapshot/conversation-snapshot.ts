import type {SerializedSession} from '@coveo/thermidor';

export const THERMIDOR_SESSION_FORMAT = 'thermidor-session';

/** A conversation as the annotation layer keeps it: its content is opaque to the layer. */
export interface ConversationSnapshot {
  format: string;
  version: string | number;
  conversation_id: string;
  title?: string | null;
  content: unknown;
}

/**
 * The snapshot of a serialized session. Its token is left out: a reopened conversation is only
 * read, never continued.
 */
export function conversationSnapshot(
  session: SerializedSession,
  conversationId: string
): ConversationSnapshot & {content: SerializedSession} {
  const {sessionToken: _token, ...content} = session;
  return {
    format: THERMIDOR_SESSION_FORMAT,
    version: session.version,
    conversation_id: conversationId,
    title: session.turns[0]?.input.prompt,
    content,
  };
}

/**
 * The session a snapshot keeps. Throws for a snapshot of another format, or one whose version
 * differs from its session's; whether that version can be restored is left to `createSession`.
 */
export function sessionToReopen(snapshot: ConversationSnapshot): SerializedSession {
  if (snapshot.format !== THERMIDOR_SESSION_FORMAT) {
    throw new Error(`"${snapshot.format}" is not a Thermidor session`);
  }
  const session = snapshot.content as SerializedSession;
  if (snapshot.version !== session.version) {
    throw new Error(
      `version ${snapshot.version} does not match its session's version ${session.version}`
    );
  }
  return session;
}
