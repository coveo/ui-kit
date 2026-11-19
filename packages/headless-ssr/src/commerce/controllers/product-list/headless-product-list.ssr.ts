import {
  buildProductListing,
  type ProductListing,
  type ProductListingState,
} from '@coveo/headless/commerce';
import {buildSearch, type Search} from '@coveo/headless/commerce';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {ProductListing, ProductListingState as ProductListState, Search};

export type ProductList = Pick<
  ProductListing | Search,
  | 'state'
  | 'subscribe'
  | 'interactiveProduct'
  | 'interactiveSpotlightContent'
  | 'promoteChildToParent'
>;

export type ProductListDefinition = SearchAndListingControllerDefinitionWithoutProps<ProductList>;

/**
 * Options for configuring the `ProductList` controller.
 */
export interface ProductListOptions {
  /**
   * When set to true, fills the `results` field rather than the `products` field
   * in the response. It may also include Spotlight Content in the results.
   * @default false
   */
  enableResults?: boolean;
}

/**
 * Defines a `ProductList` controller instance.
 * @group Definers
 *
 * @param options - The configurable `ProductList` controller options.
 * @returns The `ProductList` controller definition.
 */
export function defineProductList(options: ProductListOptions = {}): ProductListDefinition {
  const {enableResults = false} = options;

  return {
    listing: true,
    search: true,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? (buildProductListing(engine, {enableResults}) as ProductList)
        : (buildSearch(engine, {enableResults}) as ProductList),
  };
}
