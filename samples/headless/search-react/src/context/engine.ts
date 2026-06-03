import type {SearchEngine} from '@coveo/headless';
import type {RecommendationEngine} from '@coveo/headless/recommendation';
import {createContext} from 'react';

interface AppContextType {
  engine: SearchEngine;
  recommendationEngine: RecommendationEngine;
}

export const AppContext = createContext<Partial<AppContextType>>({});
