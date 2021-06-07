import {Engine, RecommendationAppState} from '@coveo/headless';
import {createContext} from 'react';

export interface AppContextType {
  engine: Engine<object>;
  recommendationEngine: Engine<RecommendationAppState>;
}

export const AppContext = createContext<Partial<AppContextType>>({});
