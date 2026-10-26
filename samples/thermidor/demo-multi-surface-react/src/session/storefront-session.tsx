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
  type NavigatorContext,
  type Session,
  type SessionSnapshot,
} from '@coveo/thermidor';
import {ComponentContractsSchema} from '@coveo/thermidor-schema/zod3';
import {SessionRequestProvider} from '../../../demo-schema-react/src/a2ui/session-request.js';
import {buildViewSurfaces, type ViewSurfaces} from '../views/view-surfaces.js';
import {createCartStore, type CartStore} from './cart-store.js';
import {createTurnScheduler, type TurnScheduler} from './turn-scheduler.js';

type StorefrontSession = Session<typeof ComponentContractsSchema>;

interface StorefrontValue {
  session: StorefrontSession;
  scheduler: TurnScheduler;
  cart: CartStore;
}

const StorefrontContext = createContext<StorefrontValue | null>(null);

/** The mock's route (`pnpm dev`), used when `VITE_COVEO_ENDPOINT` is unset. */
const MOCK_ENDPOINT = 'http://localhost:3456/converse-schema';

function envValue(name: string): string | undefined {
  const value = import.meta.env[name] as string | undefined;
  return value?.trim() ? value.trim() : undefined;
}

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
  let scheduler: TurnScheduler | undefined;

  const session = createSession({
    contracts: ComponentContractsSchema,
    // The mock accepts anything; a real Agent Gateway needs an organization, a token and a
    // tracking ID configured for that locale (see .env.example).
    organizationId: envValue('VITE_COVEO_ORGANIZATION_ID') ?? 'storefront-preview',
    accessToken: envValue('VITE_COVEO_ACCESS_TOKEN') ?? 'mock-access-token',
    endpoint: envValue('VITE_COVEO_ENDPOINT') ?? MOCK_ENDPOINT,
    trackingId: envValue('VITE_COVEO_TRACKING_ID') ?? 'storefront',
    language: envValue('VITE_COVEO_LANGUAGE') ?? 'en',
    country: envValue('VITE_COVEO_COUNTRY') ?? 'US',
    currency: envValue('VITE_COVEO_CURRENCY') ?? 'USD',
    navigatorContextProvider: getNavigatorContext,
    // The cart is app state: every request carries it, whichever view sends it.
    commerceContextProvider: () => ({
      cart: cart.getItems().map((item) => ({...item})),
      custom: {surfaceId: scheduler?.currentContext},
    }),
  });
  scheduler = createTurnScheduler(session);

  return {session, scheduler, cart};
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

export function useScheduler(): TurnScheduler {
  return useStorefront().scheduler;
}

export function useSessionSnapshot(): SessionSnapshot {
  const {session} = useStorefront();
  return useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
}

/** Every surface of the session, and the view that draws it. */
export function useViewSurfaces(): ViewSurfaces {
  const {scheduler} = useStorefront();
  const {turns} = useSessionSnapshot();
  // The scheduler tags a turn right after the session opens it, and every stream event that
  // follows re-renders, so a turn goes untagged for its first render at most.
  return useMemo(() => buildViewSurfaces(turns, scheduler), [turns, scheduler]);
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
