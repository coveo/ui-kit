import {createContext, useContext, useEffect, useRef, type PropsWithChildren} from 'react';
import {buildSearchInterface, type SearchInterface} from '@coveo/thermidor';
import {useEngine} from './engine.js';

const SearchInterfaceContext = createContext<SearchInterface | null>(null);

/**
 * Provides a SearchInterface instance to the component tree.
 * The interface is created once on mount and disposed when the provider unmounts,
 * cleaning up internal subscriptions and caches.
 */
export function SearchInterfaceProvider({children}: PropsWithChildren) {
  const engine = useEngine();
  const interfaceRef = useRef<SearchInterface | null>(null);
  interfaceRef.current ??= buildSearchInterface({engine});

  useEffect(() => {
    return () => interfaceRef.current?.dispose();
  }, []);

  return (
    <SearchInterfaceContext.Provider value={interfaceRef.current}>
      {children}
    </SearchInterfaceContext.Provider>
  );
}

/**
 * Returns the SearchInterface instance from the nearest SearchInterfaceProvider.
 */
export function useSearchInterface(): SearchInterface {
  const searchInterface = useContext(SearchInterfaceContext);
  if (!searchInterface) {
    throw new Error('useSearchInterface must be used within a SearchInterfaceProvider');
  }
  return searchInterface;
}
