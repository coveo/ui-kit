import {z} from '@coveo/bueno/zod';
import {
  requiredNonEmptyString,
  validatePayloadAndThrow,
} from '../../../utils/validate-payload.js';
import type {CategoryFacetValue} from './interfaces/response.js';

const categoryFacetValueDefinition = z.object({
  state: z.unknown(),
  numberOfResults: z.number().check(z.minimum(0)),
  value: z.string(),
  path: z.array(requiredNonEmptyString),
  moreValuesAvailable: z.optional(z.boolean()),
});

export function validateCategoryFacetValue(payload: CategoryFacetValue) {
  payload.children.forEach((child) => {
    validateCategoryFacetValue(child);
  });
  validatePayloadAndThrow(
    {
      state: payload.state,
      numberOfResults: payload.numberOfResults,
      value: payload.value,
      path: payload.path,
      moreValuesAvailable: payload.moreValuesAvailable,
    },
    categoryFacetValueDefinition
  );
}
