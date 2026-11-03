import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import {
  createSession,
  type A2uiClientMessage,
  type NavigatorContext,
  type Session,
  type SessionSnapshot,
} from '@coveo/thermidor';
import {ComponentContractsSchema} from '@coveo/thermidor-schema/zod3';
import {SessionRequestProvider} from '../../../demo-schema-react/src/a2ui/session-request.js';
import {buildViewSurfaces, type ViewSurfaces} from '../views/view-surfaces.js';
import {getSampleConfiguration} from '../env.js';
import {createCartStore, type CartStore} from './cart-store.js';

type StorefrontSession = Session<typeof ComponentContractsSchema>;

/**
 * The view a request comes from. It is sent to the server in `context.custom.surfaceId`, with the
 * values of the published contract.
 */
export type StorefrontView =
  | 'storefront-preview-home'
  | 'storefront-preview-assistant'
  | 'storefront-preview-search';

/** Which view and page visit sent each turn, keyed by turn id. */
export interface TurnViews {
  readonly turnViews: ReadonlyMap<string, StorefrontView>;
  readonly turnVisits: ReadonlyMap<string, number>;
}

interface StorefrontValue extends TurnViews {
  session: StorefrontSession;
  cart: CartStore;
  /** Sends a page's prompt on behalf of its view, and records the turn it opens. */
  sendPrompt(view: StorefrontView, prompt: string, visitId: number): void;
  /** Sends a component action on behalf of the view that draws it. */
  sendAction(view: StorefrontView, message: A2uiClientMessage): void;
}

const StorefrontContext = createContext<StorefrontValue | null>(null);

/**
 * Owns the page's ONE session. Every view (the home, assistant and search pages) sends its requests through it, naming itself in `context.custom.surfaceId`, and draws the
 * surfaces its own turns created. The session's request in flight is shared with the surfaces.
 */
export function StorefrontSessionProvider({children}: PropsWithChildren) {
  const valueRef = useRef<StorefrontValue | null>(null);
  valueRef.current ??= createStorefront();

  return (
    <StorefrontContext.Provider value={valueRef.current}>
      <SessionRequestProvider value={valueRef.current.session}>{children}</SessionRequestProvider>
    </StorefrontContext.Provider>
  );
}

function createStorefront(): StorefrontValue {
  const cart = createCartStore();
  let currentView: StorefrontView = 'storefront-preview-home';
  const turnViews = new Map<string, StorefrontView>();
  const turnVisits = new Map<string, number>();

  const session = createSession({
    contracts: ComponentContractsSchema,
    // The organization, its agent configuration and the endpoint (see src/env.ts and the README).
    ...getSampleConfiguration(),
    // The session opens on the first search: the home page sends nothing (see the README).
    initialize: false,
    navigatorContextProvider: getNavigatorContext,
    // The cart is app state: every request carries it, whichever view sends it.
    commerceContextProvider: () => ({
      cart: cart.getItems().map((item) => ({...item})),
      custom: {surfaceId: currentView},
    }),
  });

  return {
    session,
    cart,
    turnViews,
    turnVisits,
    sendPrompt(view, prompt, visitId) {
      const inFlight = session.request;
      currentView = view;
      // The session opens the turn and publishes its request before its first `await`, and
      // withholds a dispatch made while another request is in flight.
      void session.dispatchAction({name: 'submitPrompt', payload: {prompt}});
      const {request} = session;
      if (request?.kind === 'prompt' && request !== inFlight) {
        turnViews.set(request.turnId, view);
        turnVisits.set(request.turnId, visitId);
      }
    },
    sendAction(view, message) {
      currentView = view;
      void session.dispatchAction(message);
    },
  };
}

function useStorefront(): StorefrontValue {
  const value = useContext(StorefrontContext);
  if (!value) {
    throw new Error('useStorefront must be used within a StorefrontSessionProvider');
  }
  return value;
}

export function useSession(): StorefrontSession {
  return useStorefront().session;
}

export function useStorefrontSend(): Pick<StorefrontValue, 'sendPrompt' | 'sendAction'> {
  return useStorefront();
}

export function useTurnViews(): TurnViews {
  return useStorefront();
}

export function useSessionSnapshot(): SessionSnapshot {
  const {session} = useStorefront();
  return useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
}

/** Every surface of the session, and the view that draws it. */
export function useViewSurfaces(): ViewSurfaces {
  const turnViews = useTurnViews();
  const {turns} = useSessionSnapshot();
  // A turn is recorded right after the session opens it, and every stream event that follows
  // re-renders, so a turn goes unrecorded for its first render at most.
  return useMemo(() => buildViewSurfaces(turns, turnViews), [turns, turnViews]);
}

export function useCart() {
  const {cart} = useStorefront();
  const items = useSyncExternalStore(cart.subscribe, cart.getItems, cart.getItems);
  return {items, cart};
}

function getClientId() {
  const stored = sessionStorage.getItem('storefront-client-id');
  if (stored) {
    return stored;
  }
  const id = crypto.randomUUID();
  sessionStorage.setItem('storefront-client-id', id);
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
