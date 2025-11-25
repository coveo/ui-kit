import type {SchemaDefinition} from '@coveo/bueno';
import type {UnknownAction} from '@reduxjs/toolkit';
import type {CommerceAPIErrorStatusResponse} from '../../../../api/commerce/commerce-api-error-response.js';
import type {FacetSearchType} from '../../../../api/commerce/facet-search/facet-search-request.js';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine.js';
import type {stateKey} from '../../../../app/state-key.js';
import type {AnyFacetResponse} from '../../../../features/commerce/facets/facet-set/interfaces/response.js';
import type {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import type {Serializer} from '../../../../features/commerce/parameters/parameters-serializer.js';
import type {ProductListingParameters} from '../../../../features/commerce/product-listing-parameters/product-listing-parameters-actions.js';
import type {CommerceSearchParameters} from '../../../../features/commerce/search-parameters/search-parameters-actions.js';
import type {ProductListingSummaryState} from '../../product-listing/summary/headless-product-listing-summary.js';
import {
  buildDidYouMean,
  type DidYouMean,
} from '../../search/did-you-mean/headless-did-you-mean.js';
import type {SearchSummaryState} from '../../search/summary/headless-search-summary.js';
import {
  type BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from '../breadcrumb-manager/headless-core-breadcrumb-manager.js';
import type {FetchProductsActionCreator} from '../common.js';
import {buildCategoryFacet} from '../facets/category/headless-commerce-category-facet.js';
import {buildCommerceDateFacet} from '../facets/date/headless-commerce-date-facet.js';
import {
  buildFacetGenerator,
  type FacetGenerator,
} from '../facets/generator/headless-commerce-facet-generator.js';
import {buildCommerceLocationFacet} from '../facets/location/headless-commerce-location-facet.js';
import {buildCommerceNumericFacet} from '../facets/numeric/headless-commerce-numeric-facet.js';
import {buildCommerceRegularFacet} from '../facets/regular/headless-commerce-regular-facet.js';
import {
  buildCoreInteractiveProduct,
  type InteractiveProduct,
  type InteractiveProductProps,
} from '../interactive-product/headless-core-interactive-product.js';
import {
  buildCorePagination,
  type Pagination,
  type PaginationProps,
} from '../pagination/headless-core-commerce-pagination.js';
import {
  buildCoreParameterManager,
  type ParameterManager,
  type ParameterManagerProps,
} from '../parameter-manager/headless-core-parameter-manager.js';
import {
  buildCoreSort,
  type Sort,
  type SortProps,
} from '../sort/headless-core-commerce-sort.js';
import {
  buildCoreSummary,
  type Summary,
  type SummaryState,
} from '../summary/headless-core-summary.js';
import {
  buildCoreUrlManager,
  type UrlManager,
  type UrlManagerProps,
} from '../url-manager/headless-core-url-manager.js';

export interface BaseSolutionTypeSubControllers<S extends SummaryState> {
  /**
   * Creates an `InteractiveProduct` sub-controller.
   * @param props - The properties for the `InteractiveProduct` sub-controller.
   * @returns An `InteractiveProduct` sub-controller.
   */
  interactiveProduct(props: InteractiveProductProps): InteractiveProduct;

  /**
   * Creates a `Pagination` sub-controller.
   * @param props - The optional properties for the `Pagination` sub-controller.
   * @returns A `Pagination` sub-controller.
   */
  pagination(props?: PaginationProps): Pagination;

  /**
   * Creates a `Summary` sub-controller.
   * @returns A `Summary` sub-controller.
   */
  summary(): Summary<S>;
}

export interface SearchAndListingSubControllers<
  P extends Parameters,
  S extends SummaryState,
> extends BaseSolutionTypeSubControllers<S> {
  /**
   * Creates a `Sort` sub-controller.
   * @param props - Optional properties for the `Sort` sub-controller.
   * @returns A `Sort` sub-controller.
   */
  sort(props?: SortProps): Sort;

  /**
   * Creates a `FacetGenerator` sub-controller.
   * @returns A `FacetGenerator` sub-controller.
   */
  facetGenerator(): FacetGenerator;

  /**
   * Creates a `BreadcrumbManager` sub-controller.
   * @returns A `BreadcrumbManager` sub-controller.
   */
  breadcrumbManager(): BreadcrumbManager;

  /**
   * Creates a `UrlManager` sub-controller with the specified properties.
   * @param props - Properties for the `UrlManager` sub-controller.
   * @returns A `UrlManager` sub-controller.
   */
  urlManager(props: UrlManagerProps): UrlManager;

  /**
   * Creates a `ParameterManager` sub-controller with the specified properties.
   * @param props - Properties for the `ParameterManager` sub-controller.
   * @returns A `ParameterManager` sub-controller.
   */
  parameterManager(props?: ParameterManagerProps<P>): ParameterManager<P>;
}

export interface SearchSubControllers
  extends SearchAndListingSubControllers<
    CommerceSearchParameters,
    SearchSummaryState
  > {
  /**
   * Creates a `DidYouMean` sub-controller.
   * @returns A `DidYouMean` sub-controller.
   */
  didYouMean(): DidYouMean;
}

interface BaseSubControllerProps<S extends SummaryState> {
  responseIdSelector: (state: CommerceEngineState) => string;
  isLoadingSelector: (state: CommerceEngineState) => boolean;
  numberOfProductsSelector: (state: CommerceEngineState) => number;
  errorSelector: (
    state: CommerceEngineState
  ) => CommerceAPIErrorStatusResponse | null;
  pageSelector: (state: CommerceEngineState) => number;
  perPageSelector: (state: CommerceEngineState) => number;
  totalEntriesSelector: (state: CommerceEngineState) => number;
  fetchProductsActionCreator: FetchProductsActionCreator;
  fetchMoreProductsActionCreator: FetchProductsActionCreator;
  enrichSummary?: (state: CommerceEngineState) => Partial<S>;
  slotId?: string;
}

export interface SearchAndListingSubControllerProps<
  P extends Parameters,
  S extends SummaryState,
> extends BaseSubControllerProps<S> {
  facetResponseSelector: (
    state: CommerceEngine[typeof stateKey],
    facetId: string
  ) => AnyFacetResponse | undefined;
  isFacetLoadingResponseSelector: (
    state: CommerceEngine[typeof stateKey]
  ) => boolean;
  requestIdSelector: (state: CommerceEngine[typeof stateKey]) => string;
  serializer: Serializer<P>;
  parametersDefinition: SchemaDefinition<Required<P>>;
  activeParametersSelector: (state: CommerceEngine[typeof stateKey]) => P;
  restoreActionCreator: (parameters: P) => UnknownAction;
  facetSearchType: FacetSearchType;
}

/**
 * Builds the sub-controllers for the commerce search use case.
 *
 * @param engine - The commerce engine.
 * @param subControllerProps - The properties for the search sub-controllers.
 * @returns The search sub-controllers.
 */
export function buildSearchSubControllers(
  engine: CommerceEngine,
  subControllerProps: Omit<
    SearchAndListingSubControllerProps<
      CommerceSearchParameters,
      SearchSummaryState
    >,
    'facetSearchType'
  >
): SearchSubControllers {
  return {
    ...buildSearchAndListingsSubControllers(engine, {
      ...subControllerProps,
      facetSearchType: 'SEARCH',
    }),
    didYouMean() {
      return buildDidYouMean(engine);
    },
  };
}

/**
 * Builds the sub-controllers for the commerce product listing use case.
 *
 * @param engine - The commerce engine.
 * @param subControllerProps - The properties for the listing sub-controllers.
 * @returns The product listing sub-controllers.
 */
export function buildProductListingSubControllers(
  engine: CommerceEngine,
  subControllerProps: Omit<
    SearchAndListingSubControllerProps<
      ProductListingParameters,
      ProductListingSummaryState
    >,
    'facetSearchType'
  >
): SearchAndListingSubControllers<
  ProductListingParameters,
  ProductListingSummaryState
> {
  return buildSearchAndListingsSubControllers(engine, {
    ...subControllerProps,
    facetSearchType: 'LISTING',
  });
}

/**
 * Builds the sub-controllers for the commerce search and product listing use cases.
 *
 * @param engine - The commerce engine.
 * @param subControllerProps - The properties for the search and product listing sub-controllers.
 * @returns The search and product listing sub-controllers.
 */
export function buildSearchAndListingsSubControllers<
  P extends Parameters,
  S extends SummaryState,
>(
  engine: CommerceEngine,
  subControllerProps: SearchAndListingSubControllerProps<P, S>
): SearchAndListingSubControllers<P, S> {
  const {
    fetchProductsActionCreator,
    facetResponseSelector,
    isFacetLoadingResponseSelector,
    requestIdSelector,
    serializer,
    parametersDefinition,
    activeParametersSelector,
    restoreActionCreator,
    facetSearchType,
  } = subControllerProps;
  return {
    ...buildBaseSubControllers(engine, subControllerProps),
    sort(props?: SortProps) {
      return buildCoreSort(engine, {
        ...props,
        fetchProductsActionCreator,
      });
    },
    facetGenerator() {
      const commonOptions = {
        fetchProductsActionCreator,
        facetResponseSelector,
        isFacetLoadingResponseSelector,
        facetSearch: {type: facetSearchType},
      };
      return buildFacetGenerator(engine, {
        buildRegularFacet: (_engine, options) =>
          buildCommerceRegularFacet(engine, {...options, ...commonOptions}),
        buildNumericFacet: (_engine, options) =>
          buildCommerceNumericFacet(engine, {...options, ...commonOptions}),
        buildDateFacet: (_engine, options) =>
          buildCommerceDateFacet(engine, {...options, ...commonOptions}),
        buildCategoryFacet: (_engine, options) =>
          buildCategoryFacet(engine, {...options, ...commonOptions}),
        buildLocationFacet: (_engine, options) =>
          buildCommerceLocationFacet(engine, {...options, ...commonOptions}),
        fetchProductsActionCreator,
      });
    },
    breadcrumbManager() {
      return buildCoreBreadcrumbManager(engine, {
        facetResponseSelector,
        fetchProductsActionCreator,
      });
    },
    urlManager(props: UrlManagerProps) {
      return buildCoreUrlManager(engine, {
        ...props,
        requestIdSelector,
        parameterManagerBuilder: (_engine, props) =>
          this.parameterManager(props),
        serializer,
      });
    },
    parameterManager(props: ParameterManagerProps<P>) {
      return buildCoreParameterManager(engine, {
        ...props,
        parametersDefinition,
        activeParametersSelector,
        restoreActionCreator,
        fetchProductsActionCreator,
      });
    },
  };
}

/**
 * Builds the `InteractiveProduct` and `Pagination` sub-controllers for a commerce engine.
 * @param engine - The commerce engine.
 * @param subControllerProps - The properties for the `InteractiveProduct` and `Pagination` sub-controllers.
 * @returns The `InteractiveProduct` and `Pagination` sub-controllers.
 */
export function buildBaseSubControllers<S extends SummaryState>(
  engine: CommerceEngine,
  subControllerProps: BaseSubControllerProps<S>
): BaseSolutionTypeSubControllers<S> {
  const {
    responseIdSelector,
    isLoadingSelector,
    errorSelector,
    numberOfProductsSelector,
    fetchProductsActionCreator,
    fetchMoreProductsActionCreator,
    slotId,
    pageSelector,
    perPageSelector,
    totalEntriesSelector,
    enrichSummary,
  } = subControllerProps;
  return {
    interactiveProduct(props: InteractiveProductProps) {
      return buildCoreInteractiveProduct(engine, {
        ...props,
        responseIdSelector,
      });
    },
    pagination(props?: PaginationProps) {
      return buildCorePagination(engine, {
        ...props,
        options: {
          ...props?.options,
          slotId,
        },
        fetchProductsActionCreator,
        fetchMoreProductsActionCreator,
      });
    },
    summary(): Summary<S> {
      return buildCoreSummary(engine, {
        options: {
          responseIdSelector,
          isLoadingSelector,
          errorSelector,
          numberOfProductsSelector,
          pageSelector,
          perPageSelector,
          totalEntriesSelector,
          enrichSummary,
        },
      });
    },
  };
}
