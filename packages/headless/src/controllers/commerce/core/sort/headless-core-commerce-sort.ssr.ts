import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common.js';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common.js';
import {buildProductListing} from '../../product-listing/headless-product-listing.js';
import {buildSearch} from '../../search/headless-search.js';
import {Sort, SortProps, SortState} from './headless-core-commerce-sort.js';

export type {Sort, SortProps, SortState};

/**
 * Defines a `Sort` controller instance.
 *
 * @param props - The configurable `Sort` properties.
 * @returns The `Sort` controller definition.
 *
 * @internal
 */
export function defineSort<
  TOptions extends ControllerDefinitionOption | undefined,
>(props?: SortProps & TOptions) {
  ensureAtLeastOneSolutionType(props);
  return {
    ...props,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).sort(props)
        : buildSearch(engine).sort(props),
  } as SubControllerDefinitionWithoutProps<Sort, TOptions>;
}
