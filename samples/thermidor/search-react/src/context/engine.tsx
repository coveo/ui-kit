import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
} from 'react';
import {Engine} from '@coveo/thermidor';
import {getSampleConfiguration} from '../env.js';

const EngineContext = createContext<Engine | null>(null);

/**
 * Provides a single Engine instance to the component tree.
 * The engine is created once on mount and disposed when the provider unmounts.
 */
export function EngineProvider({children}: PropsWithChildren) {
  const engineRef = useRef<Engine | null>(null);
  engineRef.current ??= new Engine({
    configuration: getSampleConfiguration(),
    navigatorContextProvider: getNavigatorContext,
  });

  useEffect(() => {
    return () => engineRef.current?.dispose();
  }, []);

  return (
    <EngineContext.Provider value={engineRef.current}>
      {children}
    </EngineContext.Provider>
  );
}

/**
 * Returns the Engine instance from the nearest EngineProvider.
 */
export function useEngine(): Engine {
  const engine = useContext(EngineContext);
  if (!engine) {
    throw new Error('useEngine must be used within an EngineProvider');
  }
  return engine;
}

function getClientId() {
  const stored = sessionStorage.getItem('search-client-id');
  if (stored) {
    return stored;
  }
  const id = crypto.randomUUID();
  sessionStorage.setItem('search-client-id', id);
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
