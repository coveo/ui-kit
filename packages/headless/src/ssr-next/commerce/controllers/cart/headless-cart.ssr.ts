import {
  buildCart,
  type Cart,
  type CartInitialState,
  type CartItem,
  type CartProps,
  type CartState,
} from '../../../../controllers/commerce/context/cart/headless-cart.js';
import type {UniversalControllerDefinition} from '../../types/controller-definitions.js';

export type {Cart, CartInitialState, CartItem, CartProps, CartState};

export type CartDefinition = UniversalControllerDefinition<Cart>;

/**
 * Defines a `Cart` controller instance.
 * @group Definers
 *
 * @returns The `Cart` controller definition.
 *
 * Note: This controller is included in every engine definition and fed by the `cart` option of `fetchStaticState()`.
 */
export function defineCart(): CartDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    build: (engine, {buildConfig}) =>
      buildCart(engine, {
        initialState: buildConfig.cart ?? {},
      }),
  };
}
