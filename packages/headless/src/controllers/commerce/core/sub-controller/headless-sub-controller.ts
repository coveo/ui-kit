import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {AnyFacetResponse} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from '../breadcrumb-manager/headless-core-breadcrumb-manager';
import {FetchResultsActionCreator} from '../common';
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
  buildCoreInteractiveResult,
  InteractiveResult,
  InteractiveResultProps,
} from '../result-list/headless-core-interactive-result';
import {
  buildCoreSort,
  Sort,
  SortProps,
} from '../sort/headless-core-commerce-sort';

export interface BaseSolutionTypeSubControllers {
  interactiveResult: (props: InteractiveResultProps) => InteractiveResult;
  pagination: (props?: PaginationProps) => Pagination;
}

export interface SearchAndListingSubControllers
  extends BaseSolutionTypeSubControllers {
  sort: (props?: SortProps) => Sort;
  facetGenerator: () => FacetGenerator;
  breadcrumbManager: () => BreadcrumbManager;
}

interface BaseSubControllerProps {
  responseIdSelector: (state: CommerceEngineState) => string;
  fetchResultsActionCreator: FetchResultsActionCreator;
  slotId?: string;
}

export interface SearchAndListingSubControllerProps
  extends BaseSubControllerProps {
  facetResponseSelector: (
    state: CommerceEngine['state'],
    facetId: string
  ) => AnyFacetResponse | undefined;
  isFacetLoadingResponseSelector: (state: CommerceEngine['state']) => boolean;
}

export function buildSolutionTypeSubControllers(
  engine: CommerceEngine,
  subControllerProps: SearchAndListingSubControllerProps
): SearchAndListingSubControllers {
  const {
    fetchResultsActionCreator,
    facetResponseSelector,
    isFacetLoadingResponseSelector,
  } = subControllerProps;
  return {
    ...buildBaseSolutionTypeControllers(engine, subControllerProps),
    sort(props?: SortProps) {
      return buildCoreSort(engine, {
        ...props,
        fetchResultsActionCreator,
      });
    },
    facetGenerator() {
      const commonOptions = {
        fetchResultsActionCreator,
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
        fetchResultsActionCreator,
      });
    },
  };
}

export function buildBaseSolutionTypeControllers(
  engine: CommerceEngine,
  subControllerProps: BaseSubControllerProps
): BaseSolutionTypeSubControllers {
  const {responseIdSelector, fetchResultsActionCreator, slotId} =
    subControllerProps;
  return {
    interactiveResult(props: InteractiveResultProps) {
      return buildCoreInteractiveResult(engine, {
        ...props,
        responseIdSelector,
      });
    },
    pagination(props?: PaginationProps) {
      return buildCorePagination(engine, {
        ...props,
        slotId,
        fetchResultsActionCreator,
      });
    },
  };
}
