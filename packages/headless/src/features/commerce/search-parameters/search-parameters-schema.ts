import {SchemaDefinition, StringValue} from '@coveo/bueno';
import {parametersDefinition} from '../parameters/parameters-schema';
import {CommerceSearchParameters} from './search-parameters-actions';

export const searchParametersDefinition: SchemaDefinition<
  Required<CommerceSearchParameters>
> = {
  q: new StringValue(),
  ...parametersDefinition,
};
