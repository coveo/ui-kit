import type {NonRecommendationControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  buildInstantProducts,
  type InstantProducts,
  type InstantProductsProps,
} from './headless-instant-products.js';

export type {
  InstantProductsOptions,
  InstantProductsState,
} from './headless-instant-products.js';
export type {InstantProducts, InstantProductsProps};

export interface InstantProductsDefinition
  extends NonRecommendationControllerDefinitionWithoutProps<InstantProducts> {}

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
