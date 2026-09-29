import {createContext, useContext, useRef, type PropsWithChildren} from 'react';
import {createSession, type NavigatorContext, type Session} from '@coveo/thermidor';
import {ComponentContractsSchema} from '@coveo/thermidor-schema/zod3';
import {getSampleConfiguration} from '../env.js';

/**
 * The concrete contract this sample injects into the runtime. `@coveo/thermidor`
 * is decoupled from any specific contract package; the sample supplies the Coveo
 * `ComponentContractsSchema` so the session validates against it.
 */
type DemoSession = Session<typeof ComponentContractsSchema>;

const SessionContext = createContext<DemoSession | null>(null);

export function SessionProvider({children}: PropsWithChildren) {
  const sessionRef = useRef<DemoSession | null>(null);
  sessionRef.current ??= createThermidorSession();

  return <SessionContext.Provider value={sessionRef.current}>{children}</SessionContext.Provider>;
}

export function useSession(): DemoSession {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return session;
}

function createThermidorSession(): DemoSession {
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
