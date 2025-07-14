import {
  BooleanValue,
  NumberValue,
  RecordValue,
  type SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import type {SearchParameters} from './search-parameter-actions.js';

export const searchParametersDefinition: SchemaDefinition<
  Required<SearchParameters>
> = {
  q: new StringValue(),
  enableQuerySyntax: new BooleanValue(),
  aq: new StringValue(),
  cq: new StringValue(),
  firstResult: new NumberValue({min: 0}),
  numberOfResults: new NumberValue({min: 0}),
  sortCriteria: new StringValue(),
  f: new RecordValue(),
  fExcluded: new RecordValue(),
  cf: new RecordValue(),
  nf: new RecordValue(),
  mnf: new RecordValue(),
  df: new RecordValue(),
  debug: new BooleanValue(),
  sf: new RecordValue(),
  tab: new StringValue(),
  af: new RecordValue(),
};
