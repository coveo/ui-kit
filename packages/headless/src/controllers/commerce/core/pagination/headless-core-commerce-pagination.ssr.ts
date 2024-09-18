import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
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
