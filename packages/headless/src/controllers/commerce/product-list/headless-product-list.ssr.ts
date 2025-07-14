import {ensureAtLeastOneSolutionType} from '../../../app/commerce-ssr-engine/common.js';
import {
  type ControllerDefinitionOption,
  SolutionType,
  type SubControllerDefinitionWithoutProps,
} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  buildProductListing,
  type ProductListing,
} from '../product-listing/headless-product-listing.js';
import {buildSearch, type Search} from '../search/headless-search.js';

export type {
  ProductListing,
  ProductListingState as ProductListState,
} from '../product-listing/headless-product-listing.js';
export type {Search} from '../search/headless-search.js';

export type ProductList = Pick<
  ProductListing | Search,
  'state' | 'subscribe' | 'interactiveProduct' | 'promoteChildToParent'
>;

/**
 * Defines a `ProductList` controller instance.
 * @group Definers
 *
 * @returns The `ProductList` controller definition.
 */
export function defineProductList<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    listing: true,
    search: true,
    ...options,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? (buildProductListing(engine) as ProductList)
        : (buildSearch(engine) as ProductList),
  } as SubControllerDefinitionWithoutProps<ProductList, TOptions>;
}
