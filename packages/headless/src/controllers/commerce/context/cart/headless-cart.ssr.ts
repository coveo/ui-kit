import {UniversalControllerDefinitionWithProps} from '../../../../app/commerce-ssr-engine/types/common.js';
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
    buildWithProps: (engine, props) =>
      buildCart(engine, {initialState: props.initialState}),
  };
}
