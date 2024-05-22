import {CommerceSearchParameters} from './search-parameters-actions';
import {parametersDefinition} from '../parameters/parameters-schema';
import {SchemaDefinition, StringValue } from '@coveo/bueno';

export const searchParametersDefinition: SchemaDefinition<
  Required<CommerceSearchParameters>
> = {
  q: new StringValue(),
  ...parametersDefinition
};