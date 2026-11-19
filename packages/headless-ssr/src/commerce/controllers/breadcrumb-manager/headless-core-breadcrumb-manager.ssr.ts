import type {BreadcrumbManager, BreadcrumbManagerState} from '@coveo/headless/commerce';
import {buildProductListing} from '@coveo/headless/commerce';
import {buildSearch} from '@coveo/headless/commerce';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {BreadcrumbManager, BreadcrumbManagerState};

export type BreadcrumbManagerDefinition =
  SearchAndListingControllerDefinitionWithoutProps<BreadcrumbManager>;

/**
 * Defines a `BreadcrumbManager` controller instance.
 * @group Definers
 *
 * @returns The `BreadcrumbManager` controller definition.
 */
export function defineBreadcrumbManager(): BreadcrumbManagerDefinition {
  return {
    listing: true,
    search: true,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).breadcrumbManager()
        : buildSearch(engine).breadcrumbManager(),
  };
}
