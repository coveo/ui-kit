import {createContext, useContext, useEffect, useRef, type PropsWithChildren} from 'react';
import {Engine} from '@coveo/thermidor';
import {getSampleConfiguration} from '../env.js';

const EngineContext = createContext<Engine | null>(null);

export function EngineProvider({children}: PropsWithChildren) {
  const engineRef = useRef<Engine | null>(null);
  engineRef.current ??= new Engine({
    configuration: getSampleConfiguration(),
    navigatorContextProvider: getNavigatorContext,
  });

  useEffect(() => {
    return () => engineRef.current?.dispose();
  }, []);

  return <EngineContext.Provider value={engineRef.current}>{children}</EngineContext.Provider>;
}

export function useEngine(): Engine {
  const engine = useContext(EngineContext);
  if (!engine) {
    throw new Error('useEngine must be used within an EngineProvider');
  }
  return engine;
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

function getNavigatorContext() {
  return {
    clientId: getClientId(),
    location: window.location.href,
    referrer: document.referrer || null,
    userAgent: window.navigator.userAgent || null,
  };
}
