import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {ProductListing, buildProductListing} from './headless-product-listing';

export type {ProductListingState as ProductListState} from './headless-product-listing';
export type ProductList = Pick<ProductListing, 'state' | 'subscribe'>;

export interface ProductListDefinition
  extends ControllerDefinitionWithoutProps<CommerceEngine, ProductList> {}

/**
 * Defines a `ProductListing` controller instance.
 *
 * @param props - The configurable `ProductListing` properties.
 * @returns The `ProductListing` controller definition.
 *
 * @internal
 * */
export function defineProductList(): ProductListDefinition {
  return {
    build: (engine) => {
      const controller = buildProductListing(engine);
      return controller;
    },
  };
}
