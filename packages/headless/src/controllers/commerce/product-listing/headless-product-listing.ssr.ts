import {ensureAtLeastOneSolutionType} from '../../../app/commerce-ssr-engine/common.js';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../app/commerce-ssr-engine/types/common.js';
import {buildSearch, Search} from '../search/headless-search.js';
import {
  ProductListing,
  buildProductListing,
} from './headless-product-listing.js';

export type {ProductListingState as ProductListState} from './headless-product-listing.js';
export type ProductList = Pick<
  ProductListing | Search,
  'state' | 'subscribe' | 'interactiveProduct'
>;

/**
 * Defines a `ProductList` controller instance.
 *
 * @returns The `ProductList` controller definition.
 *
 * @internal
 * */
export function defineProductList<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? (buildProductListing(engine) as ProductList)
        : (buildSearch(engine) as ProductList),
  } as SubControllerDefinitionWithoutProps<ProductList, TOptions>;
}
