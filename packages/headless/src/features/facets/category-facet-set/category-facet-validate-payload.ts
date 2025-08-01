import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  StringValue,
  Value,
} from '@coveo/bueno';
import {
  requiredNonEmptyString,
  validatePayloadAndThrow,
} from '../../../utils/validate-payload.js';
import type {FacetValueState} from '../facet-api/value.js';
import type {CategoryFacetValue} from './interfaces/response.js';

const categoryFacetValueDefinition = {
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
