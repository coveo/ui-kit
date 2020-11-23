import {requiredNonEmptyString} from '../../generic/facet-actions-validation';
import {NumberValue, BooleanValue} from '@coveo/bueno';

export const numericFacetValueDefinition = {
  state: requiredNonEmptyString,
  start: new NumberValue({required: true}),
  end: new NumberValue({required: true}),
  endInclusive: new BooleanValue({required: true}),
  numberOfResults: new NumberValue({required: true, min: 0}),
};

export const dateFacetValueDefinition = {
  start: requiredNonEmptyString,
  end: requiredNonEmptyString,
  endInclusive: new BooleanValue({required: true}),
  state: requiredNonEmptyString,
  numberOfResults: new NumberValue({required: true, min: 0}),
};
