import {SearchEngine} from '@coveo/headless';
import {RecommendationEngine} from '@coveo/headless/recommendation';
import {createContext} from 'react';

export interface AppContextType {
  engine: SearchEngine;
  recommendationEngine: RecommendationEngine;
}

export const AppContext = createContext<Partial<AppContextType>>({});
