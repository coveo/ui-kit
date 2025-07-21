import {
  defineCommerceEngine,
  type InferHydratedState,
  type InferStaticState,
} from '@coveo/headless-react/ssr-commerce';
import options from './commerce-engine-config';

const engineDefinition = defineCommerceEngine(options);

export const {
  listingEngineDefinition: _listingEngineDefinition,
  searchEngineDefinition: _searchEngineDefinition,
  recommendationEngineDefinition: _recommendationEngineDefinition,
  standaloneEngineDefinition: _standaloneEngineDefinition,
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
  usePopularBoughtRecs,
  usePopularViewedRecs,
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

export type ListingEngineDefinition = typeof _listingEngineDefinition;
export type ListingStaticState = InferStaticState<ListingEngineDefinition>;
export type ListingHydratedState = InferHydratedState<ListingEngineDefinition>;

export type SearchEngineDefinition = typeof _searchEngineDefinition;
export type SearchStaticState = InferStaticState<SearchEngineDefinition>;
export type SearchHydratedState = InferHydratedState<SearchEngineDefinition>;

export type StandaloneEngineDefinition = typeof _standaloneEngineDefinition;
export type StandaloneStaticState =
  InferStaticState<StandaloneEngineDefinition>;
export type StandaloneHydratedState =
  InferHydratedState<StandaloneEngineDefinition>;

export type RecommendationEngineDefinition =
  typeof _recommendationEngineDefinition;
export type RecommendationStaticState =
  InferStaticState<RecommendationEngineDefinition>;
export type RecommendationHydratedState =
  InferHydratedState<RecommendationEngineDefinition>;
