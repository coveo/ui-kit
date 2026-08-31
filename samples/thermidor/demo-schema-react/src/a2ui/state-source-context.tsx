import {createContext, useContext, type PropsWithChildren} from 'react';
import type {EngineStateSource} from './controllers.js';

const StateSourceContext = createContext<EngineStateSource | null>(null);

export function StateSourceProvider({
  stateSource,
  children,
}: PropsWithChildren<{stateSource: EngineStateSource}>) {
  return <StateSourceContext.Provider value={stateSource}>{children}</StateSourceContext.Provider>;
}

export function useStateSource(): EngineStateSource {
  const source = useContext(StateSourceContext);
  if (!source) {
    throw new Error('useStateSource must be used within a StateSourceProvider');
  }
  return source;
}
