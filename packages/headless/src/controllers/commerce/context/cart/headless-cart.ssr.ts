import {UniversalControllerDefinitionWithoutProps} from '../../../../app/commerce-ssr-engine/types/common.js';
import {Cart, buildCart, CartProps, CartInitialState} from './headless-cart.js';

export type {CartState, CartItem, CartProps} from './headless-cart.js';
export type {Cart, CartInitialState};

export interface CartDefinition
  extends UniversalControllerDefinitionWithoutProps<Cart> {}

/**
 * Defines a `Cart` controller instance.
 * @group Definers
 *
 * @returns The `Cart` controller definition.
 *
 */
export function defineCart(props: CartProps = {}): CartDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    build: (engine) => buildCart(engine, props),
  };
}
