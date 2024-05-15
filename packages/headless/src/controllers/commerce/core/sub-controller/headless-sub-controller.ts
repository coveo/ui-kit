import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {AnyFacetResponse} from '../../../../features/commerce/facets/facet-set/interfaces/response';
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
  buildCoreInteractiveProduct,
  InteractiveProduct,
  InteractiveProductProps,
} from '../product-list/headless-core-interactive-product';
import {
  buildCoreSort,
  Sort,
  SortProps,
} from '../sort/headless-core-commerce-sort';

/**
 * Represents a collection of sub-controllers for a base solution type.
 */
export interface BaseSolutionTypeSubControllers {
  /**
   * Creates an instance of the InteractiveProduct sub-controller.
   * @param props - The properties for the InteractiveProduct sub-controller.
   * @returns An instance of the InteractiveProduct sub-controller.
   */
  interactiveProduct(props: InteractiveProductProps): InteractiveProduct;

  /**
   * Creates an instance of the Pagination sub-controller.
   * @param props - The optional properties for the Pagination sub-controller.
   * @returns An instance of the Pagination sub-controller.
   */
  pagination(props?: PaginationProps): Pagination;
}

/**
 * Represents the sub-controllers for search and listing functionality in a commerce application.
 */
export interface SearchAndListingSubControllers
  extends BaseSolutionTypeSubControllers {
  /**
   * Creates a `Sort` instance with the specified properties.
   * @param props - Optional properties for configuring the sort behavior.
   * @returns A `Sort` instance.
   */
  sort(props?: SortProps): Sort;

  /**
   * Creates a `FacetGenerator` instance.
   * @returns A `FacetGenerator` instance.
   */
  facetGenerator(): FacetGenerator;

  /**
   * Creates a `BreadcrumbManager` instance.
   * @returns A `BreadcrumbManager` instance.
   */
  breadcrumbManager(): BreadcrumbManager;
}

/**
 * Represents a collection of sub-controllers related to search functionality.
 * Extends the base `SearchAndListingSubControllers` interface.
 */
export interface SearchSubControllers extends SearchAndListingSubControllers {
  /**
   * Creates a `DidYouMean` sub-controller.
   * @returns A `DidYouMean` instance.
   */
  didYouMean(): DidYouMean;
}

interface BaseSubControllerProps {
  responseIdSelector: (state: CommerceEngineState) => string;
  fetchProductsActionCreator: FetchProductsActionCreator;
  fetchMoreProductsActionCreator: FetchProductsActionCreator;
  slotId?: string;
}

/**
 * Props for the SearchAndListingSubController.
 */
export interface SearchAndListingSubControllerProps
  extends BaseSubControllerProps {
  /**
   * A selector function that retrieves the facet response for a given facet ID from the state.
   * @param state - The state object from the CommerceEngine.
   * @param facetId - The ID of the facet.
   * @returns The facet response or undefined if not found.
   */
  facetResponseSelector(
    state: CommerceEngine[typeof stateKey],
    facetId: string
  ): AnyFacetResponse | undefined;

  /**
   * A selector function that determines if the facet is currently loading in the state.
   * @param state - The state object from the CommerceEngine.
   * @returns True if the facet is loading, false otherwise.
   */
  isFacetLoadingResponseSelector(
    state: CommerceEngine[typeof stateKey]
  ): boolean;
}

/**
 * Builds the search sub-controllers for the commerce engine.
 *
 * @param engine - The commerce engine.
 * @param subControllerProps - The properties for the search and listing sub-controllers.
 * @returns The search sub-controllers.
 */
export function buildSearchSubControllers(
  engine: CommerceEngine,
  subControllerProps: SearchAndListingSubControllerProps
): SearchSubControllers {
  return {
    ...buildSearchAndListingsSubControllers(engine, subControllerProps),
    didYouMean() {
      return buildDidYouMean(engine);
    },
  };
}

/**
 * Builds the search and listings sub-controllers.
 *
 * @param engine - The commerce engine.
 * @param subControllerProps - The properties for the search and listings sub-controllers.
 * @returns The search and listings sub-controllers.
 */
export function buildSearchAndListingsSubControllers(
  engine: CommerceEngine,
  subControllerProps: SearchAndListingSubControllerProps
): SearchAndListingSubControllers {
  const {
    fetchProductsActionCreator,
    facetResponseSelector,
    isFacetLoadingResponseSelector,
  } = subControllerProps;
  return {
    ...buildBaseSubControllers(engine, subControllerProps),
    /**
     * Sorts the products.
     *
     * @param props - The sort properties.
     * @returns The sorted products.
     */
    sort(props?: SortProps) {
      return buildCoreSort(engine, {
        ...props,
        fetchProductsActionCreator,
      });
    },
    /**
     * Generates the facet controllers.
     *
     * @returns The facet controllers.
     */
    facetGenerator() {
      const commonOptions = {
        fetchProductsActionCreator,
        facetResponseSelector,
        isFacetLoadingResponseSelector,
      };
      return buildFacetGenerator(engine, {
        /**
         * Builds a regular facet.
         *
         * @param _engine - The commerce engine.
         * @param options - The facet options.
         * @returns The regular facet.
         */
        buildRegularFacet: (_engine, options) =>
          buildCommerceRegularFacet(engine, {...options, ...commonOptions}),
        /**
         * Builds a numeric facet.
         *
         * @param _engine - The commerce engine.
         * @param options - The facet options.
         * @returns The numeric facet.
         */
        buildNumericFacet: (_engine, options) =>
          buildCommerceNumericFacet(engine, {...options, ...commonOptions}),
        /**
         * Builds a date facet.
         *
         * @param _engine - The commerce engine.
         * @param options - The facet options.
         * @returns The date facet.
         */
        buildDateFacet: (_engine, options) =>
          buildCommerceDateFacet(engine, {...options, ...commonOptions}),
        /**
         * Builds a category facet.
         *
         * @param _engine - The commerce engine.
         * @param options - The facet options.
         * @returns The category facet.
         */
        buildCategoryFacet: (_engine, options) =>
          buildCategoryFacet(engine, {...options, ...commonOptions}),
      });
    },
    /**
     * Manages the breadcrumbs.
     *
     * @returns The breadcrumb manager.
     */
    breadcrumbManager() {
      return buildCoreBreadcrumbManager(engine, {
        facetResponseSelector,
        fetchProductsActionCreator,
      });
    },
  };
}

/**
 * Builds the base sub-controllers for a commerce engine.
 * @param engine - The commerce engine.
 * @param subControllerProps - The properties for the base sub-controllers.
 * @returns The base solution type sub-controllers.
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
    /**
     * Builds the interactive product sub-controller.
     * @param props - The properties for the interactive product.
     * @returns The interactive product sub-controller.
     */
    interactiveProduct(props: InteractiveProductProps) {
      return buildCoreInteractiveProduct(engine, {
        ...props,
        responseIdSelector,
      });
    },
    /**
     * Builds the pagination sub-controller.
     * @param props - The optional properties for the pagination.
     * @returns The pagination sub-controller.
     */
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
