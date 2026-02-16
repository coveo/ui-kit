import {
  buildProductListing,
  type ProductListing,
  type ProductListingState,
} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {
  buildSearch,
  type Search,
} from '../../../../controllers/commerce/search/headless-search.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {Search, ProductListing, ProductListingState as ProductListState};

export type ProductList = Pick<
  ProductListing | Search,
  'state' | 'subscribe' | 'interactiveProduct' | 'promoteChildToParent'
>;

export type ProductListDefinition =
  SearchAndListingControllerDefinitionWithoutProps<ProductList>;

/**
 * Defines a `ProductList` controller instance.
 * @group Definers
 *
 * @returns The `ProductList` controller definition.
 */
export function defineProductList(): ProductListDefinition {
  return {
    listing: true,
    search: true,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? (buildProductListing(engine) as ProductList)
        : (buildSearch(engine) as ProductList),
  };
}
