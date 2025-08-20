import {
  buildCart,
  type Cart,
  type CartInitialState,
  type CartItem,
  type CartProps,
  type CartState,
} from '../../../../controllers/commerce/context/cart/headless-cart.js';
import type {UniversalControllerDefinitionWithProps} from '../../types/controller-definitions.js';
import {createControllerWithKind, Kind} from '../../types/kind.js';

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
 */
export function defineCart(): CartDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    recommendation: true,
    buildWithProps: (engine, props) => {
      const controller = buildCart(engine, {
        initialState: props ? props.initialState : {},
      });
      return createControllerWithKind(controller, Kind.Cart);
    },
  };
}
