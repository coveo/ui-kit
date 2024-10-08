import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common.js';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common.js';
import {buildProductListing} from '../../product-listing/headless-product-listing.js';
import {buildSearch} from '../../search/headless-search.js';
import {
  Pagination,
  PaginationProps,
  PaginationState,
} from './headless-core-commerce-pagination.js';

export type {Pagination, PaginationProps, PaginationState};

/**
 * Defines a `Pagination` controller instance.
 *
 * @param props - The configurable `Pagination` properties.
 * @returns The `Pagination` controller definition.
 *
 * @internal
 */
export function definePagination<
  TOptions extends ControllerDefinitionOption | undefined,
>(props?: PaginationProps & TOptions) {
  ensureAtLeastOneSolutionType(props);
  return {
    ...props,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).pagination(props)
        : buildSearch(engine).pagination(props),
  } as SubControllerDefinitionWithoutProps<Pagination, TOptions>;
}
