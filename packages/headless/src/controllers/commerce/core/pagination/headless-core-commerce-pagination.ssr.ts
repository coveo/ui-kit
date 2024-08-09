import {SSRCommerceEngine} from '../../../../app/commerce-engine/commerce-engine.ssr';
import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
  DefinedSolutionTypes,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common';
import {buildProductListing} from '../../product-listing/headless-product-listing';
import {buildSearch} from '../../search/headless-search';
import {
  Pagination,
  PaginationProps,
  PaginationState,
} from './headless-core-commerce-pagination';

export type {Pagination, PaginationProps, PaginationState};

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
