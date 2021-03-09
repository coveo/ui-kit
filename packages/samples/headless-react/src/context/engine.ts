import {
  HeadlessEngine,
  searchAppReducers,
  recommendationAppReducers,
} from '@coveo/headless';
import {createContext} from 'react';

export interface AppContextType {
  engine: HeadlessEngine<typeof searchAppReducers>;
  recommendationEngine: HeadlessEngine<typeof recommendationAppReducers>;
}

export const AppContext = createContext<Partial<AppContextType>>({});
