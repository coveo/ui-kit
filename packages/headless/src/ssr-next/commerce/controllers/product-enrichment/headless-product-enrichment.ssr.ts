import {
  buildProductEnrichment,
  type ProductEnrichment,
  type ProductEnrichmentProps,
  type ProductEnrichmentState,
} from '../../../../controllers/commerce/product-enrichment/headless-product-enrichment.js';
import type {StandaloneControllerDefinition} from '../../types/controller-definitions.js';

export type {ProductEnrichment, ProductEnrichmentProps, ProductEnrichmentState};

export interface ProductEnrichmentDefinition extends StandaloneControllerDefinition<ProductEnrichment> {}

/**
 * Defines the `ProductEnrichment` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @param props - The static `ProductEnrichment` properties, such as the placements to fetch badges
 *  from. The product being viewed comes from the `productId` option of `fetchStaticState()`.
 * @returns The `ProductEnrichment` controller definition.
 */
export function defineProductEnrichment(
  props: ProductEnrichmentProps = {}
): ProductEnrichmentDefinition {
  return {
    standalone: true,
    build: (engine, {buildConfig}) =>
      buildProductEnrichment(engine, {
        ...props,
        options: {
          ...props.options,
          ...(buildConfig.productId !== undefined && {productId: buildConfig.productId}),
        },
      }),
  };
}
