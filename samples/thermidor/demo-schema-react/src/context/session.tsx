import {createContext, useContext, useRef, type PropsWithChildren} from 'react';
import {createSession, type NavigatorContext, type Session} from '@coveo/thermidor';
import {ComponentContractsSchema} from '@coveo/thermidor-schema/zod3';
import {getSampleConfiguration} from '../env.js';
import {CartStoreContext} from '../cart/CartProvider.js';
import type {CartStore} from '../cart/cart-store.js';

/**
 * The concrete contract this sample injects into the runtime. `@coveo/thermidor`
 * is decoupled from any specific contract package; the sample supplies the Coveo
 * `ComponentContractsSchema` so the session validates against it.
 */
export type DemoSession = Session<typeof ComponentContractsSchema>;

const SessionContext = createContext<DemoSession | null>(null);

interface SessionProviderProps {
  /** The session to provide. Defaults to one created from the sample configuration. */
  session?: DemoSession;
}

export function SessionProvider({session, children}: PropsWithChildren<SessionProviderProps>) {
  const cart = useContext(CartStoreContext);
  const sessionRef = useRef<DemoSession | null>(session ?? null);
  if (!sessionRef.current) {
    if (!cart) {
      throw new Error('SessionProvider must be used within a CartProvider, or be given a session');
    }
    sessionRef.current = createThermidorSession(cart);
  }

  return <SessionContext.Provider value={sessionRef.current}>{children}</SessionContext.Provider>;
}

export function useSession(): DemoSession {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return session;
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

function createThermidorSession(cart: CartStore): DemoSession {
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
