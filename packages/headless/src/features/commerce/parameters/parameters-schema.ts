import {NumberValue, RecordValue} from '@coveo/bueno';

export const parametersDefinition = {
  f: new RecordValue(),
  cf: new RecordValue(),
  nf: new RecordValue(),
  cnf: new RecordValue(),
  df: new RecordValue(),
  sortCriteria: new RecordValue(),
  page: new NumberValue({min: 0}),
  perPage: new NumberValue({min: 1}),
};
