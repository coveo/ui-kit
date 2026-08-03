import {createContext, useContext, useEffect, useRef, type PropsWithChildren} from 'react';
import {buildCommerceInterface, type CommerceInterface} from '@coveo/thermidor';
import {useEngine} from './engine.js';

const CommerceInterfaceContext = createContext<CommerceInterface | null>(null);

/**
 * Provides a CommerceInterface instance to the component tree.
 * The interface is created once on mount and disposed when the provider unmounts,
 * cleaning up internal subscriptions and caches.
 */
export function CommerceInterfaceProvider({children}: PropsWithChildren) {
  const engine = useEngine();
  const interfaceRef = useRef<CommerceInterface | null>(null);
  interfaceRef.current ??= buildCommerceInterface({engine});

  useEffect(() => {
    return () => interfaceRef.current?.dispose();
  }, []);

  return (
    <CommerceInterfaceContext.Provider value={interfaceRef.current}>
      {children}
    </CommerceInterfaceContext.Provider>
  );
}

/**
 * Returns the CommerceInterface instance from the nearest CommerceInterfaceProvider.
 */
export function useCommerceInterface(): CommerceInterface {
  const commerceInterface = useContext(CommerceInterfaceContext);
  if (!commerceInterface) {
    throw new Error('useCommerceInterface must be used within a CommerceInterfaceProvider');
  }
  return commerceInterface;
}
