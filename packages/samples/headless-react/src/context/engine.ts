import {SearchEngine} from '@coveo/headless';
import {CommerceEngine} from '@coveo/headless/commerce';
import {RecommendationEngine} from '@coveo/headless/recommendation';
import {createContext} from 'react';

export interface AppContextType {
  engine: SearchEngine;
  recommendationEngine: RecommendationEngine;
  commerceEngine: CommerceEngine;
}

export const AppContext = createContext<Partial<AppContextType>>({});
