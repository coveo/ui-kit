import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import {createSession, type NavigatorContext, type Session, type Turn} from '@coveo/thermidor';
import {ComponentContractsSchema} from '@coveo/thermidor-schema/zod3';
import {getSampleConfiguration} from '../../../demo-schema-react/src/env.js';
import {buildSurfaceLayout, type SurfaceLayout} from '../layout/surface-layout.js';
import {createCartStore, type CartStore} from './cart-store.js';
import {createTurnScheduler, type TurnScheduler} from './turn-scheduler.js';

type StorefrontSession = Session<typeof ComponentContractsSchema>;

interface StorefrontValue {
  session: StorefrontSession;
  scheduler: TurnScheduler;
  cart: CartStore;
}

const StorefrontContext = createContext<StorefrontValue | null>(null);

/**
 * Owns the page's ONE session. Every area (the header, the home page, the assistant page) sends
 * its requests through it, naming itself in `context.custom.surfaceId`, and draws the surfaces the
 * server places in its slots.
 */
export function StorefrontSessionProvider({children}: PropsWithChildren) {
  const valueRef = useRef<StorefrontValue | null>(null);
  valueRef.current ??= createStorefront();

  return (
    <StorefrontContext.Provider value={valueRef.current}>{children}</StorefrontContext.Provider>
  );
}

function createStorefront(): StorefrontValue {
  const {organizationId, accessToken, endpoint, trackingId, language, country, currency} =
    getSampleConfiguration();
  const cart = createCartStore();
  let scheduler: TurnScheduler | undefined;

  const session = createSession({
    contracts: ComponentContractsSchema,
    organizationId,
    accessToken,
    endpoint,
    trackingId,
    language,
    country,
    currency,
    // A surface lives until the server deletes it, so the header's surfaces stay interactive
    // while the page below them has turns of its own.
    surfaceScope: 'session',
    navigatorContextProvider: getNavigatorContext,
    commerceContextProvider: () => ({
      cart: [...cart.getItems()],
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

export function useTurns(): readonly Turn[] {
  const {session} = useStorefront();
  const subscribe = useCallback((listener: () => void) => session.subscribe(listener), [session]);
  const getTurns = useCallback(() => session.turns, [session]);
  return useSyncExternalStore(subscribe, getTurns, getTurns);
}

export function useSurfaceLayout(): SurfaceLayout {
  const turns = useTurns();
  return useMemo(() => buildSurfaceLayout(turns), [turns]);
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
