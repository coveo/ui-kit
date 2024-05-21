import {StringValue, SchemaDefinition, RecordValue, NumberValue} from '@coveo/bueno';
import {
  CommerceSearchParameters,

} from './search-parameter-actions';

const commonParametersDefinition = {
  f: new RecordValue(),
  cf: new RecordValue(),
  nf: new RecordValue(),
  df: new RecordValue(),
  sortCriteria: new RecordValue(),
  page: new NumberValue({min: 0}),
  perPage: new NumberValue({min: 1}),
}

export const searchParametersDefinition: SchemaDefinition<
  Required<CommerceSearchParameters>
> = {
  q: new StringValue(),
  ...commonParametersDefinition
};

export const productListingParametersDefinition = commonParametersDefinition;
