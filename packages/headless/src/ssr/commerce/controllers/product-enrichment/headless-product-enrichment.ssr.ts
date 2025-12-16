import {
  buildProductEnrichment,
  type ProductEnrichment,
  type ProductEnrichmentProps,
  type ProductEnrichmentState,
} from '../../../../controllers/commerce/product-enrichment/headless-product-enrichment.js';
import type {StandaloneControllerWithoutProps} from '../../types/controller-definitions.js';

export type {ProductEnrichmentState, ProductEnrichment, ProductEnrichmentProps};

export interface ProductEnrichmentDefinition
  extends StandaloneControllerWithoutProps<ProductEnrichment> {}

/**
 * Defines the `ProductEnrichment` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @param props - The configurable `ProductEnrichment` properties.
 * @returns The `ProductEnrichment` controller definition.
 */
export function defineProductEnrichment(
  props: ProductEnrichmentProps
): ProductEnrichmentDefinition {
  return {
    standalone: true,
    build: (engine) => buildProductEnrichment(engine, props),
  };
}
