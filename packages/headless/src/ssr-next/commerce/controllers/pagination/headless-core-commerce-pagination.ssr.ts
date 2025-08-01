import type {
  CorePaginationOptions,
  Pagination,
  PaginationOptions,
  PaginationProps,
  PaginationState,
} from '../../../../controllers/commerce/core/pagination/headless-core-commerce-pagination.js';
import {buildProductListing} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import {ensureAtLeastOneSolutionType} from '../../../../ssr/commerce/controller-utils.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {
  ControllerDefinitionOption,
  SubControllerDefinitionWithoutProps,
} from '../../types/controller-definitions.js';

export type {
  Pagination,
  PaginationProps,
  PaginationState,
  PaginationOptions,
  CorePaginationOptions,
};

/**
 * Defines a `Pagination` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Pagination` properties.
 * @returns The `Pagination` controller definition.
 */
export function definePagination<
  TOptions extends ControllerDefinitionOption | undefined,
>(props?: PaginationProps & TOptions) {
  ensureAtLeastOneSolutionType(props);
  return {
    listing: true,
    search: true,
    ...props,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).pagination(props)
        : buildSearch(engine).pagination(props),
  } as SubControllerDefinitionWithoutProps<Pagination, TOptions>;
}
