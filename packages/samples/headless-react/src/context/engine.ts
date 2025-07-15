import type {SearchEngine} from '@coveo/headless';
import type {CommerceEngine} from '@coveo/headless/commerce';
import type {RecommendationEngine} from '@coveo/headless/recommendation';
import {createContext} from 'react';

export interface AppContextType {
  engine: SearchEngine;
  recommendationEngine: RecommendationEngine;
  commerceEngine: CommerceEngine;
}

export const AppContext = createContext<Partial<AppContextType>>({});
