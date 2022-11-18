import {RecordValue, NumberValue, StringValue} from '@coveo/bueno';
import {facetIdDefinition} from '../../generic/facet-actions-validation';

export const facetSearchOptionsDefinition = {
  facetId: facetIdDefinition,
  captions: new RecordValue({options: {required: false}}),
  numberOfValues: new NumberValue({required: false, min: 1}),
  query: new StringValue({required: false, emptyAllowed: true}),
};
