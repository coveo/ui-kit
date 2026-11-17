import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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
import {CartStoreContext} from '../cart/CartProvider.js';
import type {CartStore} from '../cart/cart-store.js';
import {isBlocking} from '../a2ui/session-request.js';
import {
  createConversationStorage,
  type ConversationStorage,
  type ConversationSummary,
} from '../conversations/conversation-storage.js';

/**
 * The concrete contract this sample injects into the runtime. `@coveo/thermidor`
 * is decoupled from any specific contract package; the sample supplies the Coveo
 * `ComponentContractsSchema` so the session validates against it.
 */
export type DemoSession = Session<typeof ComponentContractsSchema>;

/** Creates a session, restoring `saved` when given. */
export type SessionFactory = (saved?: SerializedSession) => DemoSession;

export interface Conversations {
  /** The saved conversations, newest first. */
  list: readonly ConversationSummary[];
  /** The conversation the page shows. Saved once its first turn completes. */
  currentId: string;
  start(): void;
  open(id: string): void;
  remove(id: string): void;
}

interface Current {
  id: string;
  session: DemoSession;
}

const SessionContext = createContext<DemoSession | null>(null);
const ConversationsContext = createContext<Conversations | null>(null);

interface SessionProviderProps {
  /** The session to start with. Defaults to the current conversation, or a new one. */
  session?: DemoSession;
  /** Creates the sessions of new and restored conversations. Defaults to the sample configuration. */
  createSession?: SessionFactory;
  /** Where conversations are saved. Defaults to the browser's storage. */
  storage?: ConversationStorage;
}

/**
 * Provides the session of the current conversation, and the saved conversations to switch to.
 * The session is saved after each turn and each action that updates its results. A reload resumes
 * the current conversation; a new tab starts a new one.
 */
export function SessionProvider({
  session: initialSession,
  createSession: givenFactory,
  storage: givenStorage,
  children,
}: PropsWithChildren<SessionProviderProps>) {
  const cart = useContext(CartStoreContext);
  const [storage] = useState(() => givenStorage ?? createConversationStorage());
  const [create] = useState(() => givenFactory ?? defaultFactory(cart));
  const [current, setCurrent] = useState<Current>(() =>
    initialSession ? startWith(storage, initialSession) : openCurrent(storage, create)
  );
  const [list, setList] = useState(storage.list);

  useEffect(
    () => persist(storage, current, setCurrent, () => setList(storage.list())),
    [storage, current]
  );

  const conversations = useMemo<Conversations>(() => {
    const swap = (next: () => Current) => {
      current.session.cancel();
      setCurrent(next());
      setList(storage.list());
    };
    return {
      list,
      currentId: current.id,
      start: () => swap(() => startWith(storage, create())),
      open: (id) => {
        if (id !== current.id) {
          storage.setCurrentId(id);
          swap(() => openCurrent(storage, create));
        }
      },
      remove: (id) => {
        storage.remove(id);
        if (id === current.id) {
          swap(() => startWith(storage, create()));
        } else {
          setList(storage.list());
        }
      },
    };
  }, [list, current, storage, create]);

  return (
    <ConversationsContext.Provider value={conversations}>
      <SessionContext.Provider value={current.session}>{children}</SessionContext.Provider>
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

function defaultFactory(cart: CartStore | null): SessionFactory {
  return (saved) => {
    if (!cart) {
      throw new Error('SessionProvider must be used within a CartProvider, or be given a session');
    }
    return createThermidorSession(cart, saved);
  };
}

function startWith(storage: ConversationStorage, session: DemoSession): Current {
  const id = crypto.randomUUID();
  storage.setCurrentId(id);
  return {id, session};
}

/** The conversation the tab last showed, or a new one when it is gone or cannot be restored. */
function openCurrent(storage: ConversationStorage, create: SessionFactory): Current {
  const id = storage.currentId();
  const saved = id === undefined ? undefined : storage.load(id);
  if (id !== undefined && saved) {
    try {
      return {id, session: create(saved)};
    } catch {
      storage.remove(id);
    }
  }
  return startWith(storage, create());
}

/**
 * Saves the conversation each time a request that updates it ends. When the session answers under
 * another id, as when the conversation it resumed had expired, it becomes a new conversation, so
 * the saved one keeps its transcript.
 */
function persist(
  storage: ConversationStorage,
  {id, session}: Current,
  setCurrent: (current: Current) => void,
  onSaved: () => void
) {
  const boundSessionId = session.sessionId;
  let saving = false;
  return session.subscribe(() => {
    const {sessionId} = session;
    if (boundSessionId !== undefined && sessionId !== undefined && sessionId !== boundSessionId) {
      setCurrent(startWith(storage, session));
      return;
    }
    const {request, turns} = session.getSnapshot();
    if (saving && !request && turns.length > 0) {
      storage.save(id, titleOf(turns[0].input), session.serialize());
      onSaved();
    }
    saving = isBlocking(request) && request?.kind !== 'initialize';
  });
}

function titleOf({prompt, action}: DemoSession['turns'][number]['input']): string {
  const text = (action?.context as {text?: unknown} | undefined)?.text;
  return prompt ?? (typeof text === 'string' ? text : 'New conversation');
}

/** Read fresh for each request. */
function getCartCommerceContext(cart: CartStore) {
  return {
    cart: cart.getSnapshot().cart.items.map(({productId, name, unitPrice, quantity}) => ({
      productId,
      name,
      price: unitPrice,
      quantity,
    })),
  };
}

function createThermidorSession(
  cart: CartStore,
  sessionToRestore?: SerializedSession
): DemoSession {
  const {
    organizationId,
    accessToken,
    endpoint,
    agentConfigurationId,
    trackingId,
    language,
    country,
    currency,
  } = getSampleConfiguration();

  return createSession({
    contracts: ComponentContractsSchema,
    organizationId,
    accessToken,
    endpoint,
    agentConfigurationId,
    trackingId,
    navigatorContextProvider: () => ({...getNavigatorContext(), language, country, currency}),
    commerceContextProvider: () => getCartCommerceContext(cart),
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

function getNavigatorContext(): Omit<NavigatorContext, 'language' | 'country' | 'currency'> {
  return {
    clientId: getClientId(),
    location: window.location.href,
    referrer: document.referrer || null,
    userAgent: window.navigator.userAgent || null,
  };
}
