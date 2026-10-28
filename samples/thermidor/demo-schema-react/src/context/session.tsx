import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  createSession,
  type NavigatorContext,
  type SerializedSession,
  type Session,
} from '@coveo/thermidor';
import {ComponentContractsSchema} from '@coveo/thermidor-schema/zod3';
import {getSampleConfiguration} from '../env.js';
import {
  forgetCurrentConversation,
  keepCurrentConversation,
  readCurrentConversation,
} from './current-conversation.js';

/**
 * The concrete contract this sample injects into the runtime. `@coveo/thermidor`
 * is decoupled from any specific contract package; the sample supplies the Coveo
 * `ComponentContractsSchema` so the session validates against it.
 */
type DemoSession = Session<typeof ComponentContractsSchema>;

/** Where a session opened in place of the current one comes from. */
export interface ConversationSource {
  sessionToRestore?: SerializedSession;
  /** A read-only conversation is only shown: it can't be continued, even once the page reloads. */
  readOnly?: boolean;
}

export interface Conversations {
  /**
   * Replaces the current session with one opened from `source`, remounting everything below the
   * provider so no state from the previous conversation lingers. Throws, leaving the current
   * session in place, when `source` cannot be restored.
   */
  open(source: ConversationSource): void;
  /** Forgets the current conversation and opens an empty one. */
  startNew(): void;
  /** Whether the open conversation is read-only. */
  readOnly: boolean;
}

interface OpenSession {
  id: number;
  session: DemoSession;
  readOnly: boolean;
}

const SessionContext = createContext<DemoSession | null>(null);
const ConversationsContext = createContext<Conversations | null>(null);

export function SessionProvider({children}: PropsWithChildren) {
  const [current, setCurrent] = useState<OpenSession>(() => ({
    id: 0,
    ...restoreCurrentConversation(),
  }));
  const {session, readOnly} = current;
  // A replaced session still notifies while its cancelled request unwinds; only the open one is kept.
  const keptSession = useRef(session);

  useEffect(
    () =>
      session.subscribe(() => {
        if (keptSession.current === session) {
          keepCurrentConversation({session: session.serialize(), readOnly});
        }
      }),
    [session, readOnly]
  );

  const open = useCallback(
    ({sessionToRestore, readOnly = false}: ConversationSource) => {
      const next = createThermidorSession(sessionToRestore);
      keptSession.current = next;
      keepCurrentConversation({session: next.serialize(), readOnly});
      session.cancel();
      setCurrent(({id}) => ({id: id + 1, session: next, readOnly}));
    },
    [session]
  );
  const conversations = useMemo<Conversations>(
    () => ({
      open,
      startNew() {
        forgetCurrentConversation();
        open({});
      },
      readOnly,
    }),
    [open, readOnly]
  );

  return (
    <ConversationsContext.Provider value={conversations}>
      <SessionContext.Provider key={current.id} value={session}>
        {children}
      </SessionContext.Provider>
    </ConversationsContext.Provider>
  );
}

export function useSession(): DemoSession {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return session;
}

export function useConversations(): Conversations {
  const conversations = useContext(ConversationsContext);
  if (!conversations) {
    throw new Error('useConversations must be used within a SessionProvider');
  }
  return conversations;
}

function restoreCurrentConversation(): Omit<OpenSession, 'id'> {
  const kept = readCurrentConversation();
  try {
    return {session: createThermidorSession(kept?.session), readOnly: kept?.readOnly ?? false};
  } catch {
    forgetCurrentConversation();
    return {session: createThermidorSession(), readOnly: false};
  }
}

function createThermidorSession(sessionToRestore?: SerializedSession): DemoSession {
  const {organizationId, accessToken, endpoint, trackingId, language, country, currency} =
    getSampleConfiguration();

  return createSession({
    contracts: ComponentContractsSchema,
    organizationId,
    accessToken,
    endpoint,
    trackingId,
    language,
    country,
    currency,
    navigatorContextProvider: getNavigatorContext,
    sessionToRestore,
  });
}

function getClientId() {
  const stored = sessionStorage.getItem('demo-client-id');
  if (stored) {
    return stored;
  }
  const id = crypto.randomUUID();
  sessionStorage.setItem('demo-client-id', id);
  return id;
}

function getNavigatorContext(): NavigatorContext {
  return {
    clientId: getClientId(),
    location: window.location.href,
    referrer: document.referrer || null,
    userAgent: window.navigator.userAgent || null,
  };
}
