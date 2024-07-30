import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {Cart, buildCart} from './headless-cart';

export type {CartState, CartItem} from './headless-cart';
export type {Cart};

export interface CartDefinition
  extends ControllerDefinitionWithoutProps<CommerceEngine, Cart> {}

/**
 * Defines a `Cart` controller instance.
 *
 * @returns The `Cart` controller definition.
 *
 * @internal
 */
export function defineCart(): CartDefinition {
  return {
    build: (engine) => buildCart(engine),
  };
}
