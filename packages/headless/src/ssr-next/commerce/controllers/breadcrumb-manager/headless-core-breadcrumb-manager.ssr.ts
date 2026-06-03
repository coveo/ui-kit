import type {
  BreadcrumbManager,
  BreadcrumbManagerState,
} from '../../../../controllers/commerce/core/breadcrumb-manager/headless-core-breadcrumb-manager.js';
import {buildProductListing} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
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
