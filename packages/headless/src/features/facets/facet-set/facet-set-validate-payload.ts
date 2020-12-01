import {requiredNonEmptyString} from '../generic/facet-actions-validation';
import {NumberValue} from '@coveo/bueno';

export const facetValueDefinition = {
  value: requiredNonEmptyString,
  numberOfResults: new NumberValue({min: 0}),
  state: requiredNonEmptyString,
};
