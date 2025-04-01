import {NumberValue, RecordValue} from '@coveo/bueno';

export const parametersDefinition = {
  f: new RecordValue(),
  fExcluded: new RecordValue(),
  lf: new RecordValue(),
  cf: new RecordValue(),
  nf: new RecordValue(),
  nfExcluded: new RecordValue(),
  mnf: new RecordValue(),
  mnfExcluded: new RecordValue(),
  df: new RecordValue(),
  dfExcluded: new RecordValue(),
  sortCriteria: new RecordValue(),
  page: new NumberValue({min: 0}),
  perPage: new NumberValue({min: 1}),
};
