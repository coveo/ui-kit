import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
} from 'react';
import {
  buildGenerativeInterface,
  type GenerativeInterface,
} from '@coveo/thermidor';
import {useEngine} from './engine.js';

const GenerativeInterfaceContext = createContext<GenerativeInterface | null>(
  null
);

/**
 * Provides a GenerativeInterface instance to the component tree.
 * The interface is created once on mount and disposed when the provider unmounts,
 * cleaning up internal subscriptions and caches.
 */
export function GenerativeInterfaceProvider({children}: PropsWithChildren) {
  const engine = useEngine();
  const interfaceRef = useRef(buildGenerativeInterface({engine}));

  useEffect(() => {
    return () => interfaceRef.current.dispose();
  }, []);

  return (
    <GenerativeInterfaceContext.Provider value={interfaceRef.current}>
      {children}
    </GenerativeInterfaceContext.Provider>
  );
}

/**
 * Returns the GenerativeInterface instance from the nearest GenerativeInterfaceProvider.
 */
export function useGenerativeInterface(): GenerativeInterface {
  const generativeInterface = useContext(GenerativeInterfaceContext);
  if (!generativeInterface) {
    throw new Error(
      'useGenerativeInterface must be used within a GenerativeInterfaceProvider'
    );
  }
  return generativeInterface;
}
