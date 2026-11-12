import {
  buildProductListing,
  type ProductListing,
  type ProductListingState,
} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch, type Search} from '../../../../controllers/commerce/search/headless-search.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinition} from '../../types/controller-definitions.js';

export type {ProductListing, ProductListingState as ProductListState, Search};

export type ProductList = Pick<
  ProductListing | Search,
  | 'state'
  | 'subscribe'
  | 'interactiveProduct'
  | 'interactiveSpotlightContent'
  | 'promoteChildToParent'
>;

export type ProductListDefinition = SearchAndListingControllerDefinition<ProductList>;

/**
 * Defines a `ProductList` controller instance.
 * @group Definers
 *
 * @returns The `ProductList` controller definition. Whether its requests fill `results` rather than
 *  `products` comes from the `enableResults` option of the engine definition.
 */
export function defineProductList(): ProductListDefinition {
  return {
    listing: true,
    search: true,
    build: (engine, {solutionType, enableResults}) =>
      solutionType === SolutionType.listing
        ? (buildProductListing(engine, {enableResults: enableResults.listing}) as ProductList)
        : (buildSearch(engine, {enableResults: enableResults.search}) as ProductList),
  };
}
