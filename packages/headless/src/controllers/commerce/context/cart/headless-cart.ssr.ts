import {UniversalControllerDefinitionWithProps} from '../../../../app/commerce-ssr-engine/types/common.js';
import {
  createControllerWithKind,
  Kind,
} from '../../../../app/commerce-ssr-engine/types/kind.js';
import {MissingControllerProps} from '../../../../utils/errors.js';
import {Cart, buildCart, CartInitialState} from './headless-cart.js';

export type {CartState, CartItem, CartProps} from './headless-cart.js';
export type {Cart, CartInitialState};

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
      if (props === undefined) {
        throw new MissingControllerProps(Kind.Cart);
      }
      const controller = buildCart(engine, {initialState: props.initialState});
      return createControllerWithKind(controller, Kind.Cart);
    },
  };
}
