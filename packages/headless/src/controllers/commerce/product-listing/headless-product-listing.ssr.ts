import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  ProductListing as ProductListingController,
  buildProductListing,
} from './headless-product-listing';

export type {ProductListingState} from './headless-product-listing';
export type ProductListing = Pick<
  ProductListingController,
  'state' | 'subscribe'
>;

export interface ProductListDefinition
  extends ControllerDefinitionWithoutProps<CommerceEngine, ProductListing> {}

/**
 * Defines a `ProductListing` controller instance.
 *
 * @returns The `ProductListing` controller definition.
 *
 * @internal
 * */
export function defineProductListing(): ProductListDefinition {
  return {
    build: (engine) => buildProductListing(engine),
  };
}
