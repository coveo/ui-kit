import {ensureAtLeastOneSolutionType} from '../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../app/commerce-ssr-engine/types/common';
import {
  ProductListing,
  buildProductListing,
} from '../product-listing/headless-product-listing';
import {buildSearch, Search} from '../search/headless-search';

export type {ProductListingState as ProductListState} from '../product-listing/headless-product-listing';
export type ProductList = Pick<ProductListing | Search, 'state' | 'subscribe'>;

/**
 * Defines the `ProductList` controller for the purpose of server-side rendering.
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
