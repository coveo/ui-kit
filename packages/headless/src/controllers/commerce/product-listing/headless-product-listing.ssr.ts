import {SSRCommerceEngine} from '../../../app/commerce-engine/commerce-engine.ssr';
import {ensureAtLeastOneSolutionType} from '../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
  DefinedSolutionTypes,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../app/commerce-ssr-engine/types/common';
import {buildSearch, Search} from '../search/headless-search';
import {ProductListing, buildProductListing} from './headless-product-listing';

export type {ProductListingState as ProductListState} from './headless-product-listing';
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
    build: (
      engine: SSRCommerceEngine,
      solutionType: DefinedSolutionTypes<typeof options>
    ) =>
      solutionType === SolutionType.listing
        ? (buildProductListing(engine) as ProductList)
        : (buildSearch(engine) as ProductList),
  } as SubControllerDefinitionWithoutProps<ProductList, TOptions>;
}
