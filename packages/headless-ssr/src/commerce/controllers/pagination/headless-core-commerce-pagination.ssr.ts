import type {CorePaginationOptions} from '@coveo/headless/ssr-internal';
import type {
  Pagination,
  PaginationOptions,
  PaginationProps,
  PaginationState,
} from '@coveo/headless/commerce';
import {buildProductListing} from '@coveo/headless/commerce';
import {buildSearch} from '@coveo/headless/commerce';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {
  CorePaginationOptions,
  Pagination,
  PaginationOptions,
  PaginationProps,
  PaginationState,
};

export type PaginationDefinition = SearchAndListingControllerDefinitionWithoutProps<Pagination>;

/**
 * Defines a `Pagination` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Pagination` properties.
 * @returns The `Pagination` controller definition.
 */
export function definePagination(props?: PaginationProps): PaginationDefinition {
  return {
    listing: true,
    search: true,
    ...props,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).pagination(props)
        : buildSearch(engine).pagination(props),
  };
}
