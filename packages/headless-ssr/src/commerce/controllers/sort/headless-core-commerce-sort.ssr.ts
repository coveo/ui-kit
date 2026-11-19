import type {Sort, SortProps, SortState} from '@coveo/headless/commerce';
import {buildProductListing} from '@coveo/headless/commerce';
import {buildSearch} from '@coveo/headless/commerce';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {Sort, SortProps, SortState};

export type SortDefinition = SearchAndListingControllerDefinitionWithoutProps<Sort>;

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
