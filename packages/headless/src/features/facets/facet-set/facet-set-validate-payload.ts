import {NumberValue} from '../../../utils/bueno-zod.js';
import {requiredNonEmptyString} from '../../../utils/validate-payload.js';

export const facetValueDefinition = {
  value: requiredNonEmptyString,
  numberOfResults: new NumberValue({min: 0}),
  state: requiredNonEmptyString,
};
