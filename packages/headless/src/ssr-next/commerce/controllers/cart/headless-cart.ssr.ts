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

export type CartDefinition = UniversalControllerDefinitionWithProps<
  Cart,
  CartBuildProps
>;

/**
 * Defines a `Cart` controller instance.
 * @group Definers
 *
 * @returns The `Cart` controller definition.
 *
 * Note: This controller is automatically included in all engine definitions. You do not need to add it manually to your engine definition configuration.
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
