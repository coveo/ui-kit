import {
  Value,
  NumberValue,
  StringValue,
  ArrayValue,
  BooleanValue,
} from '@coveo/bueno';
import {
  validatePayloadAndThrow,
  requiredNonEmptyString,
} from '../../../utils/validate-payload.js';
import {FacetValueState} from '../facet-api/value.js';
import {CategoryFacetValue} from './interfaces/response.js';

export const categoryFacetValueDefinition = {
  state: new Value<FacetValueState>({required: true}),
  numberOfResults: new NumberValue({required: true, min: 0}),
  value: new StringValue({required: true, emptyAllowed: true}),
  path: new ArrayValue({required: true, each: requiredNonEmptyString}),
  moreValuesAvailable: new BooleanValue({required: false}),
};

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
