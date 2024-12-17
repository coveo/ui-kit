import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common.js';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common.js';
import {buildProductListing} from '../../product-listing/headless-product-listing.js';
import {buildSearch} from '../../search/headless-search.js';
import {
  BreadcrumbManager,
  BreadcrumbManagerState,
} from './headless-core-breadcrumb-manager.js';

export type {BreadcrumbManager, BreadcrumbManagerState};

/**
 * Defines a `BreadcrumbManager` controller instance.
 * @group Definers
 *
 * @returns The `BreadcrumbManager` controller definition.
 *
 * @internal
 */
export function defineBreadcrumbManager<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
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
