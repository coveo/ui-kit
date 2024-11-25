import {UniversalControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  InstantProducts,
  InstantProductsProps,
  buildInstantProducts,
} from './headless-instant-products.js';

export type {
  InstantProductsOptions,
  InstantProductsState,
} from './headless-instant-products.js';
export type {InstantProducts, InstantProductsProps};

export interface InstantProductsDefinition
  extends UniversalControllerDefinitionWithoutProps<InstantProducts> {}

/**
 * Defines the `InstantProducts` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @returns The `InstantProducts` controller definition.
 *
 * @internal
 */
export function defineInstantProducts(
  props: InstantProductsProps
): InstantProductsDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    build: (engine) => buildInstantProducts(engine, props),
  };
}
