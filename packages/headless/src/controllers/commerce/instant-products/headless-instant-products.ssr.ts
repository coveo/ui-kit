import {SharedControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {
  InstantProducts,
  InstantProductsProps,
  buildInstantProducts,
} from './headless-instant-products';

export type {
  InstantProductsOptions,
  InstantProductsState,
} from './headless-instant-products';
export type {InstantProducts, InstantProductsProps};

export interface InstantProductsDefinition
  extends SharedControllerDefinitionWithoutProps<InstantProducts> {}

/**
 * Defines an `InstantProducts` controller instance.
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
    build: (engine) => buildInstantProducts(engine, props),
  };
}
