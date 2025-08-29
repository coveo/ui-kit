import {
  buildCart,
  type Cart,
  type CartInitialState,
  type CartItem,
  type CartProps,
  type CartState,
} from '../../../../controllers/commerce/context/cart/headless-cart.js';
import type {UniversalControllerDefinitionWithProps} from '../../types/controller-definitions.js';

export type {Cart, CartInitialState, CartItem, CartProps, CartState};

export interface CartBuildProps {
  initialState: CartInitialState;
}

export interface CartDefinition
  extends UniversalControllerDefinitionWithProps<Cart, CartBuildProps> {}

/**
 * Defines a `Cart` controller instance.
 * @group Definers
 *
 * @returns The `Cart` controller definition.
 */
export function defineCart(): CartDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    recommendation: true,
    buildWithProps: (engine, props) => {
      return buildCart(engine, {
        initialState: props ? props.initialState : {},
      });
    },
  };
}
