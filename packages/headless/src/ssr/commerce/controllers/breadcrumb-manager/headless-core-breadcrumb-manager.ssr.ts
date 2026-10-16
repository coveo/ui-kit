import type {
  BreadcrumbManager,
  BreadcrumbManagerState,
} from '../../../../controllers/commerce/core/breadcrumb-manager/headless-core-breadcrumb-manager.js';
import {buildProductListing} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import {ensureAtLeastOneSolutionType} from '../../../../ssr/commerce/controller-utils.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {
  ControllerDefinitionOption,
  SubControllerDefinitionWithoutProps,
} from '../../types/controller-definitions.js';

export type {BreadcrumbManager, BreadcrumbManagerState};

/**
 * Defines a `BreadcrumbManager` controller instance.
 * @group Definers
 *
 * @param options - Deprecated `listing` and `search` options, which will be removed in the next
 * major version: omit them to build the controller for both search and product listing pages.
 * @returns The `BreadcrumbManager` controller definition.
 */
export function defineBreadcrumbManager<TOptions extends ControllerDefinitionOption | undefined>(
  options?: TOptions
) {
  ensureAtLeastOneSolutionType(options);
  return {
    listing: true,
    search: true,
    ...options,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).breadcrumbManager()
        : buildSearch(engine).breadcrumbManager(),
  } as SubControllerDefinitionWithoutProps<BreadcrumbManager, TOptions>;
}
