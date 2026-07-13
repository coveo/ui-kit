import {defineCommerceEngine} from '@coveo/headless-react/ssr-commerce';
import engineConfig from './commerce-engine-config';

const engineDefinition = defineCommerceEngine(engineConfig);

export const {
  listingEngineDefinition,
  searchEngineDefinition,
  recommendationEngineDefinition,
  standaloneEngineDefinition,
} = engineDefinition;

export const {
  useCart,
  useContext,
  useProductList,
  useDidYouMean,
  useInstantProducts,
  usePagination,
  usePopularBought,
  usePopularViewed,
  useSearchBox,
  useSort,
  useStandaloneSearchBox,
  useSummary,
  useFacetGenerator,
  useBreadcrumbManager,
  useParameterManager,
} = engineDefinition.controllers;
