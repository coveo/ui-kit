import {createContext, useContext, useRef, type PropsWithChildren} from 'react';
import {createSession, type NavigatorContext, type Session} from '@coveo/thermidor';
import {ComponentContractsSchema} from '@coveo/thermidor-schema';
import {getSampleConfiguration} from '../env.js';

type ThermidorSession = Session<typeof ComponentContractsSchema>;

const SessionContext = createContext<ThermidorSession | null>(null);

export function SessionProvider({children}: PropsWithChildren) {
  const sessionRef = useRef<ThermidorSession | null>(null);
  sessionRef.current ??= createThermidorSession();

  return <SessionContext.Provider value={sessionRef.current}>{children}</SessionContext.Provider>;
}

export function useSession(): ThermidorSession {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return session;
}

function createThermidorSession(): ThermidorSession {
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
