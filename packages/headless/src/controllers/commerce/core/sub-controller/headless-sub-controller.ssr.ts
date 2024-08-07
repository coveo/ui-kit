import {SSRCommerceEngine} from '../../../../app/commerce-engine/commerce-engine.ssr';
import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
  SolutionType,
  DefinedSolutionTypes,
  SubControllerDefinitionWithoutProps,
  SubControllerDefinitionWithProps,
} from '../../../../app/commerce-ssr-engine/types/common';
import type {
  Summary as HeadlessSummary,
  SummaryState,
} from '../../core/summary/headless-core-summary';
import {buildProductListing} from '../../product-listing/headless-product-listing';
import {buildSearch} from '../../search/headless-search';
import {BreadcrumbManager} from '../breadcrumb-manager/headless-core-breadcrumb-manager';
import {FacetGenerator} from '../facets/generator/headless-commerce-facet-generator';
import {
  Pagination,
  PaginationProps,
  PaginationState,
} from '../pagination/headless-core-commerce-pagination';
import {Sort, SortProps, SortState} from '../sort/headless-core-commerce-sort';
import {
  UrlManager,
  UrlManagerProps,
} from '../url-manager/headless-core-url-manager';

export type {SummaryState};
export type Summary = Pick<HeadlessSummary, 'state' | 'subscribe'>;

export function defineSummary<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (
      engine: SSRCommerceEngine,
      solutionType: DefinedSolutionTypes<typeof options>
    ) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).summary()
        : buildSearch(engine).summary(),
  } as SubControllerDefinitionWithoutProps<Summary, TOptions>;
}

export type {PaginationState, Pagination};

export function definePagination<
  TOptions extends ControllerDefinitionOption | undefined,
>(props?: PaginationProps, options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (
      engine: SSRCommerceEngine,
      solutionType: DefinedSolutionTypes<typeof options>
    ) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).pagination(props)
        : buildSearch(engine).pagination(props),
  } as SubControllerDefinitionWithoutProps<Pagination, TOptions>;
}

export function defineUrlManager<
  TOptions extends ControllerDefinitionOption | undefined,
>(props: UrlManagerProps, options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (
      engine: SSRCommerceEngine,
      solutionType: DefinedSolutionTypes<typeof options>
    ) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).urlManager(props)
        : buildSearch(engine).urlManager(props),
  } as SubControllerDefinitionWithProps<UrlManager, TOptions, UrlManagerProps>;
}

export type {Sort, SortState};

export function defineSort<
  TOptions extends ControllerDefinitionOption | undefined,
>(props?: SortProps, options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (
      engine: SSRCommerceEngine,
      solutionType: DefinedSolutionTypes<typeof options>
    ) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).sort(props)
        : buildSearch(engine).sort(props),
  } as SubControllerDefinitionWithoutProps<Sort, TOptions>;
}

export function defineDidYouMean() {
  return {
    build: (engine: SSRCommerceEngine) => buildSearch(engine).sort(),
  };
}

export function defineFacetGenerator<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (
      engine: SSRCommerceEngine,
      solutionType: DefinedSolutionTypes<typeof options>
    ) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).facetGenerator()
        : buildSearch(engine).facetGenerator(),
  } as SubControllerDefinitionWithoutProps<FacetGenerator, TOptions>;
}

export function defineBreadcrumbManager<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (
      engine: SSRCommerceEngine,
      solutionType: DefinedSolutionTypes<typeof options>
    ) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).breadcrumbManager()
        : buildSearch(engine).breadcrumbManager(),
  } as SubControllerDefinitionWithoutProps<BreadcrumbManager, TOptions>;
}

// instant product is a challenge because it does not implement the Controller interface
// parameter manager is a challenge because its props interface varies according to the use case: easy solution would be to define one for search and one for plp
