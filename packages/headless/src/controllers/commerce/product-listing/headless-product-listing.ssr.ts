import {ensureAtLeastOneSolutionType} from '../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../app/commerce-ssr-engine/types/common';
import {buildSearch, Search} from '../search/headless-search';
import {ProductListing, buildProductListing} from './headless-product-listing';

export type {ProductListingState as ProductListState} from './headless-product-listing';
export type ProductList = Pick<ProductListing | Search, 'state' | 'subscribe'>;

/**
 * Defines a `ProductListing` controller instance.
 *
 * @returns The `ProductListing` controller definition.
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
