import {ArrayValue, Schema} from '@coveo/bueno';
import type {ProductEnrichmentOptions} from '../../../controllers/commerce/product-enrichment/headless-product-enrichment.js';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload.js';
import {
  MAXIMUM_PLACEMENT_IDS,
  MINIMUM_PLACEMENT_IDS,
} from './product-enrichment-constants.js';

export const productEnrichmentDefinition = {
  placementIds: new ArrayValue({
    required: false,
    min: MINIMUM_PLACEMENT_IDS,
    max: MAXIMUM_PLACEMENT_IDS,
    each: requiredNonEmptyString,
  }),
  productId: nonEmptyString,
};

export const productEnrichmentOptionsSchema =
  new Schema<ProductEnrichmentOptions>(productEnrichmentDefinition);
