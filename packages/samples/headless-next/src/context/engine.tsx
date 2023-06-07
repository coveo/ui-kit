'use client';

import {
  SearchEngine,
  SearchEngineOptions,
  buildSearchEngine,
} from '@coveo/headless';
import {
  FunctionComponent,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react';

const clientEngineContext = createContext<SearchEngine | null>(null);
const {Provider} = clientEngineContext;

export const ClientSearchEngineProvider: FunctionComponent<
  PropsWithChildren<{options: SearchEngineOptions}>
> = ({options, children}) => {
  const engine = useMemo(() => buildSearchEngine(options), [options]);

  return <Provider value={engine}>{children}</Provider>;
};

export const useClientSearchEngine = () => {
  const engine = useContext(clientEngineContext);
  if (!engine) {
    throw 'Expected engine to be defined.';
  }
  return engine;
};
