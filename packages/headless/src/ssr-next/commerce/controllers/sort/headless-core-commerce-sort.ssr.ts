import type {
  Sort,
  SortProps,
  SortState,
} from '../../../../controllers/commerce/core/sort/headless-core-commerce-sort.js';
import {buildProductListing} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {Sort, SortProps, SortState};

export type SortDefinition =
  SearchAndListingControllerDefinitionWithoutProps<Sort>;

/**
 * Defines a `Sort` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Sort` properties.
 * @returns The `Sort` controller definition.
 */
export function defineSort(props?: SortProps): SortDefinition {
  return {
    listing: true,
    search: true,
    ...props,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).sort(props)
        : buildSearch(engine).sort(props),
  };
}
