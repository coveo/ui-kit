import {SchemaDefinition, StringValue} from '@coveo/bueno';
import {parametersDefinition} from '../parameters/parameters-schema.js';
import {CommerceSearchParameters} from './search-parameters-actions.js';

export const searchParametersDefinition: SchemaDefinition<
  Required<CommerceSearchParameters>
> = {
  q: new StringValue(),
  ...parametersDefinition,
};
