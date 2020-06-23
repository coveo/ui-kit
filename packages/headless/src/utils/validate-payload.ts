import {SchemaDefinition, SchemaValue, Schema} from '@coveo/bueno';

export const validatePayloadSchema = <P>(
  payload: P,
  schemaDefinition: SchemaDefinition<Required<P>>
) => {
  const schema = new Schema(schemaDefinition);
  const validatedPayload = schema.validate(payload);
  return {payload: validatedPayload as P};
};

export const validatePayloadValue = <P>(
  payload: P,
  schemaValue: SchemaValue<P>
) => {
  const schema = new Schema({value: schemaValue});
  const validatedPayload = schema.validate({value: payload}).value;
  return {payload: validatedPayload as P};
};
