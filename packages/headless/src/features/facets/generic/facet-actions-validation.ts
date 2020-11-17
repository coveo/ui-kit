import {StringValue} from '@coveo/bueno';

export const requiredNonEmptyString = new StringValue({
  required: true,
  emptyAllowed: true,
});

export const facetIdDefinition = new StringValue({
  required: true,
  emptyAllowed: true,
});
