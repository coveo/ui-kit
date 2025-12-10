import {ArrayValue, Schema} from '@coveo/bueno';
import type {ProductEnrichmentOptions} from '../../../controllers/commerce/product-enrichment/headless-product-enrichment.js';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload.js';

export const productEnrichmentDefinition = {
  placementIds: new ArrayValue({
    required: false,
    min: 1,
    each: requiredNonEmptyString,
  }),
  productId: nonEmptyString,
};

export const productEnrichmentOptionsSchema =
  new Schema<ProductEnrichmentOptions>(productEnrichmentDefinition);
