import {
  buildProductEnrichment,
  type ProductEnrichment,
  type ProductEnrichmentProps,
  type ProductEnrichmentState,
} from '../../../../controllers/commerce/product-enrichment/headless-product-enrichment.js';
import {MissingControllerProps} from '../../../common/errors.js';
import type {StandaloneControllerWithProps} from '../../types/controller-definitions.js';

export type {ProductEnrichmentState, ProductEnrichment, ProductEnrichmentProps};

export interface ProductEnrichmentDefinition
  extends StandaloneControllerWithProps<
    ProductEnrichment,
    ProductEnrichmentProps
  > {}

/**
 * Defines the `ProductEnrichment` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @param props - The configurable `ProductEnrichment` properties.
 * @returns The `ProductEnrichment` controller definition.
 */
export function defineProductEnrichment(): ProductEnrichmentDefinition {
  return {
    standalone: true,
    buildWithProps: (engine, props) => {
      if (props === undefined) {
        throw new MissingControllerProps('ProductEnrichment');
      }
      return buildProductEnrichment(engine, props);
    },
  };
}
