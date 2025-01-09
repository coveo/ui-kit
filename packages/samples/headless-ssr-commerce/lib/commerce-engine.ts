import {defineCommerceEngine} from '@coveo/headless-react/ssr-commerce';
import engineConfig from './commerce-engine-config';

export const engineDefinition = defineCommerceEngine(engineConfig);

export const {
  listingEngineDefinition,
  searchEngineDefinition,
  recommendationEngineDefinition,
  standaloneEngineDefinition,
  useEngine,
} = engineDefinition;

export const {
  useCart,
  useContext,
  useProductList,
  useDidYouMean,
  useInstantProducts,
  useNotifyTrigger,
  usePagination,
  usePopularBought,
  usePopularViewed,
  useViewedTogether,
  useProductView,
  useQueryTrigger,
  useRecentQueriesList,
  useRedirectionTrigger,
  useSearchBox,
  useSort,
  useStandaloneSearchBox,
  useSummary,
  useFacetGenerator,
  useBreadcrumbManager,
  useParameterManager,
} = engineDefinition.controllers;
