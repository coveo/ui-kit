import {
  buildInstantProducts,
  type InstantProducts,
  type InstantProductsOptions,
  type InstantProductsProps,
  type InstantProductsState,
} from '../../../../controllers/commerce/instant-products/headless-instant-products.js';
import type {NonRecommendationControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {
  InstantProductsOptions,
  InstantProductsState,
  InstantProducts,
  InstantProductsProps,
};

export type InstantProductsDefinition =
  NonRecommendationControllerDefinitionWithoutProps<InstantProducts>;

/**
 * Defines the `InstantProducts` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @returns The `InstantProducts` controller definition.
 */
export function defineInstantProducts(
  props: InstantProductsProps = {options: {}}
): InstantProductsDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    build: (engine) => buildInstantProducts(engine, props),
  };
}
