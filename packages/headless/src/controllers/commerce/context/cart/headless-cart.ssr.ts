import {UniversalControllerDefinitionWithProps} from '../../../../app/commerce-ssr-engine/types/common.js';
import {Kind} from '../../../../app/commerce-ssr-engine/types/kind.js';
import {ControllerWithKind} from '../../../../app/ssr-engine/types/common.js';
import {Cart, buildCart, CartInitialState} from './headless-cart.js';

export type {CartState, CartItem, CartProps} from './headless-cart.js';
export type {Cart, CartInitialState};

export interface CartBuildProps {
  initialState: CartInitialState;
}
interface InternalCart extends Cart, ControllerWithKind {
  _kind: Kind.Cart;
  state: Cart['state'];
}

export interface CartDefinition
  extends UniversalControllerDefinitionWithProps<
    InternalCart,
    CartBuildProps
  > {}

/**
 * Defines a `Cart` controller instance.
 * @group Definers
 *
 * @returns The `Cart` controller definition.
 *
 * @internal
 */
export function defineCart(): CartDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    recommendation: true,
    buildWithProps: (engine, props) => {
      return {
        ...buildCart(engine, {initialState: props.initialState}),
        _kind: Kind.Cart,
      };
    },
  };
}
