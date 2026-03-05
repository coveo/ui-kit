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
import {SolutionType} from '../../types/controller-constants.js';
import type {
  ControllerDefinitionOption,
  SubControllerDefinitionWithoutProps,
} from '../../types/controller-definitions.js';

export type {Search, ProductListing, ProductListingState as ProductListState};

export type ProductList = Pick<
  ProductListing | Search,
  | 'state'
  | 'subscribe'
  | 'interactiveProduct'
  | 'promoteChildToParent'
  | 'interactiveSpotlightContent'
>;

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
export function defineProductList<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions & ProductListOptions) {
  ensureAtLeastOneSolutionType(options);
  const {enableResults = false, ...restOptions} = options || {};

  return {
    listing: true,
    search: true,
    ...restOptions,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? (buildProductListing(engine, {enableResults}) as ProductList)
        : (buildSearch(engine, {enableResults}) as ProductList),
  } as SubControllerDefinitionWithoutProps<ProductList, TOptions>;
}
