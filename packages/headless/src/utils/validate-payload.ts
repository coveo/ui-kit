import {SchemaDefinition, Schema} from '@coveo/bueno';

export const validatePayload = <P>(
  payload: P,
  schemaDefinition: SchemaDefinition<Required<P>>
) => {
  const schema = new Schema(schemaDefinition);
  const validatedPayload = schema.validate(payload);
  return {payload: validatedPayload as P};
};
