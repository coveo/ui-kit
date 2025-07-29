import type {
  Sort,
  SortProps,
  SortState,
} from '../../../../controllers/commerce/core/sort/headless-core-commerce-sort.js';
import {buildProductListing} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import {ensureAtLeastOneSolutionType} from '../../../../ssr/commerce/controller-utils.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {
  ControllerDefinitionOption,
  SubControllerDefinitionWithoutProps,
} from '../../types/controller-definitions.js';

export type {Sort, SortProps, SortState};

/**
 * Defines a `Sort` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Sort` properties.
 * @returns The `Sort` controller definition.
 */
export function defineSort<
  TOptions extends ControllerDefinitionOption | undefined,
>(props?: SortProps & TOptions) {
  ensureAtLeastOneSolutionType(props);
  return {
    listing: true,
    search: true,
    ...props,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).sort(props)
        : buildSearch(engine).sort(props),
  } as SubControllerDefinitionWithoutProps<Sort, TOptions>;
}
