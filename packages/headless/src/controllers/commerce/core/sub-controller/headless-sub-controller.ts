import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {AnyFacetResponse} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {
  CommerceSearchParameters,
  Parameters,
  ProductListingParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {Serializer} from '../../../../features/commerce/search-parameters/search-parameter-serializer';
import {
  buildDidYouMean,
  DidYouMean,
} from '../../search/did-you-mean/headless-did-you-mean';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from '../breadcrumb-manager/headless-core-breadcrumb-manager';
import {FetchProductsActionCreator} from '../common';
import {buildCategoryFacet} from '../facets/category/headless-commerce-category-facet';
import {buildCommerceDateFacet} from '../facets/date/headless-commerce-date-facet';
import {
  buildFacetGenerator,
  FacetGenerator,
} from '../facets/generator/headless-commerce-facet-generator';
import {buildCommerceNumericFacet} from '../facets/numeric/headless-commerce-numeric-facet';
import {buildCommerceRegularFacet} from '../facets/regular/headless-commerce-regular-facet';
import {
  buildCorePagination,
  Pagination,
  PaginationProps,
} from '../pagination/headless-core-commerce-pagination';
import {
  ParameterManager,
  ParameterManagerProps,
} from '../parameter-manager/headless-core-parameter-manager';
import {
  buildCoreInteractiveProduct,
  InteractiveProduct,
  InteractiveProductProps,
} from '../product-list/headless-core-interactive-product';
import {
  buildCoreSort,
  Sort,
  SortProps,
} from '../sort/headless-core-commerce-sort';
import {
  buildCoreUrlManager,
  UrlManager,
  type UrlManagerProps,
} from '../url-manager/headless-core-url-manager';

export interface BaseSolutionTypeSubControllers {
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
}

export interface SearchAndListingSubControllers
  extends BaseSolutionTypeSubControllers {
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
}

export interface SearchSubControllers extends SearchAndListingSubControllers {
  /**
   * Creates a `DidYouMean` sub-controller.
   * @returns A `DidYouMean` sub-controller.
   */
  didYouMean(): DidYouMean;
}

interface BaseSubControllerProps {
  responseIdSelector: (state: CommerceEngineState) => string;
  fetchProductsActionCreator: FetchProductsActionCreator;
  fetchMoreProductsActionCreator: FetchProductsActionCreator;
  slotId?: string;
}

export interface SearchAndListingSubControllerProps<T extends Parameters>
  extends BaseSubControllerProps {
  facetResponseSelector: (
    state: CommerceEngine[typeof stateKey],
    facetId: string
  ) => AnyFacetResponse | undefined;

  isFacetLoadingResponseSelector: (
    state: CommerceEngine[typeof stateKey]
  ) => boolean;
  requestIdSelector: (state: CommerceEngine[typeof stateKey]) => string;
  parameterManagerBuilder: (
    engine: CommerceEngine,
    props: ParameterManagerProps<T>
  ) => ParameterManager<T>;
  serializer: Serializer<T>;
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
  subControllerProps: SearchAndListingSubControllerProps<CommerceSearchParameters>
): SearchSubControllers {
  return {
    ...buildSearchAndListingsSubControllers(engine, subControllerProps),
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
  subControllerProps: SearchAndListingSubControllerProps<ProductListingParameters>
): SearchAndListingSubControllers {
  return buildSearchAndListingsSubControllers(engine, subControllerProps);
}

/**
 * Builds the sub-controllers for the search and product listing use cases.
 *
 * @param engine - The commerce engine.
 * @param subControllerProps - The properties for the search and product listing sub-controllers.
 * @returns The search and product listing sub-controllers.
 */
export function buildSearchAndListingsSubControllers<P extends Parameters>(
  engine: CommerceEngine,
  subControllerProps: SearchAndListingSubControllerProps<P>
): SearchAndListingSubControllers {
  const {
    fetchProductsActionCreator,
    facetResponseSelector,
    isFacetLoadingResponseSelector,
    requestIdSelector,
    parameterManagerBuilder,
    serializer,
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
        parameterManagerBuilder,
        serializer,
      });
    },
  };
}

/**
 * Builds the `InteractiveProduct` and `Pagination` sub-controllers for a commerce engine.
 * @param engine - The commerce engine.
 * @param subControllerProps - The properties for the base sub-controllers.
 * @returns The `InteractiveProduct` and `Pagination` sub-controllers.
 */
export function buildBaseSubControllers(
  engine: CommerceEngine,
  subControllerProps: BaseSubControllerProps
): BaseSolutionTypeSubControllers {
  const {
    responseIdSelector,
    fetchProductsActionCreator,
    fetchMoreProductsActionCreator,
    slotId,
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
  };
}
