import {SearchEngine} from '@coveo/headless';
import {CommerceEngine} from '@coveo/headless/commerce';
import {ProductListingEngine} from '@coveo/headless/product-listing';
import {ProductRecommendationEngine} from '@coveo/headless/product-recommendation';
import {RecommendationEngine} from '@coveo/headless/recommendation';
import {createContext} from 'react';

export interface AppContextType {
  engine: SearchEngine;
  recommendationEngine: RecommendationEngine;
  productListingEngine: ProductListingEngine;
  productRecommendationEngine: ProductRecommendationEngine;
  commerceEngine: CommerceEngine;
}

export const AppContext = createContext<Partial<AppContextType>>({});
