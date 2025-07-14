import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common.js';
import {
  type ControllerDefinitionOption,
  SolutionType,
  type SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common.js';
import {buildProductListing} from '../../product-listing/headless-product-listing.js';
import {buildSearch} from '../../search/headless-search.js';
import type {
  Sort,
  SortProps,
  SortState,
} from './headless-core-commerce-sort.js';

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
