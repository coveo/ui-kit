import {type SchemaDefinition, StringValue} from '../../../utils/bueno-zod.js';
import {parametersDefinition} from '../parameters/parameters-schema.js';
import type {CommerceSearchParameters} from './search-parameters-actions.js';

export const searchParametersDefinition: SchemaDefinition<
  Required<CommerceSearchParameters>
> = {
  q: new StringValue(),
  ...parametersDefinition,
};
