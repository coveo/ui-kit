import {SharedControllerDefinitionWithoutProps} from '../../../../app/commerce-ssr-engine/types/common';
import {Cart, buildCart} from './headless-cart';

export type {CartState, CartItem} from './headless-cart';
export type {Cart};

export interface CartDefinition
  extends SharedControllerDefinitionWithoutProps<Cart> {}

/**
 * Defines a `Cart` controller instance.
 *
 * @returns The `Cart` controller definition.
 *
 * @internal
 */
export function defineCart(): CartDefinition {
  return {
    listing: true,
    search: true,
    build: (engine) => buildCart(engine),
  };
}
