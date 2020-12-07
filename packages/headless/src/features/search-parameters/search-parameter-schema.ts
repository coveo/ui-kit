import {
  BooleanValue,
  StringValue,
  SchemaDefinition,
  NumberValue,
  RecordValue,
} from '@coveo/bueno';
import {SearchParameters} from './search-parameter-actions';

export const searchParametersDefinition: SchemaDefinition<Required<
  SearchParameters
>> = {
  q: new StringValue(),
  enableQuerySyntax: new BooleanValue(),
  aq: new StringValue(),
  cq: new StringValue(),
  firstResult: new NumberValue({min: 0}),
  numberOfResults: new NumberValue({min: 0}),
  sortCriteria: new StringValue(),
  f: new RecordValue(),
  cf: new RecordValue(),
};
