import {SharedControllerDefinitionWithoutProps} from '../../../../app/commerce-ssr-engine/types/common';
import {Cart, buildCart, CartProps, CartInitialState} from './headless-cart';

export type {CartState, CartItem, CartProps} from './headless-cart';
export type {Cart, CartInitialState};

export interface CartDefinition
  extends SharedControllerDefinitionWithoutProps<Cart> {}

/**
 * Defines the `Cart` controller for the purpose of server-side rendering.
 *
 * @returns The `Cart` controller definition.
 *
 * @internal
 */
export function defineCart(props: CartProps = {}): CartDefinition {
  return {
    listing: true,
    search: true,
    build: (engine) => buildCart(engine, props),
  };
}