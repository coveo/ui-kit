import {UniversalControllerDefinitionWithoutProps} from '../../../../app/commerce-ssr-engine/types/common';
import {Cart, buildCart, CartProps, CartInitialState} from './headless-cart';

export type {CartState, CartItem, CartProps} from './headless-cart';
export type {Cart, CartInitialState};

export interface CartDefinition
  extends UniversalControllerDefinitionWithoutProps<Cart> {}

/**
 * Defines a `Cart` controller instance.
 *
 * @returns The `Cart` controller definition.
 *
 * @internal
 */
export function defineCart(props: CartProps = {}): CartDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    build: (engine) => buildCart(engine, props),
  };
}
