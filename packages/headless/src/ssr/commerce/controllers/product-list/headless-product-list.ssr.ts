import {
  buildProductListing,
  type ProductListing,
  type ProductListingState,
} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {
  buildSearch,
  type Search,
} from '../../../../controllers/commerce/search/headless-search.js';
import {ensureAtLeastOneSolutionType} from '../../controller-utils.js';
import {
  type ControllerDefinitionOption,
  SolutionType,
  type SubControllerDefinitionWithoutProps,
} from '../../types/common.js';

export type {Search, ProductListing, ProductListingState as ProductListState};

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
