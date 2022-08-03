import {SearchEngine} from '@coveo/headless';
import {ProductListingEngine} from '@coveo/headless/product-listing';
import {RecommendationEngine} from '@coveo/headless/recommendation';
import {ProductRecommendationEngine} from '@coveo/headless/product-recommendation';
import {createContext} from 'react';

export interface AppContextType {
  engine: SearchEngine;
  recommendationEngine: RecommendationEngine;
  productListingEngine: ProductListingEngine;
  productRecommendationEngine: ProductRecommendationEngine;
}

export const AppContext = createContext<Partial<AppContextType>>({});
