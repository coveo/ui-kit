import {
  buildCart,
  type Cart,
  type CartInitialState,
  type CartItem,
  type CartProps,
  type CartState,
} from '../../../../controllers/commerce/context/cart/headless-cart.js';
import {MissingControllerProps} from '../../../common/errors.js';
import type {UniversalControllerDefinitionWithProps} from '../../types/controller-definitions.js';
import {createControllerWithKind, Kind} from '../../types/kind.js';

export type {Cart, CartInitialState, CartItem, CartProps, CartState};

export interface CartBuildProps {
  initialState: CartInitialState;
}

export interface CartDefinition
  extends UniversalControllerDefinitionWithProps<Cart, CartBuildProps> {}

/**
 * @deprecated In the future, the context controller will be included by default in the engine definition. You will no longer need to define it manually
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
      if (props === undefined) {
        throw new MissingControllerProps(Kind.Cart);
      }
      const controller = buildCart(engine, {initialState: props.initialState});
      return createControllerWithKind(controller, Kind.Cart);
    },
  };
}
