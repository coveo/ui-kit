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

export const validateInitialState = <T extends object>(
  schema: Schema<T>,
  obj: T | undefined,
  functionName: string
) => {
  const message = `Check the initialState of ${functionName}`;
  return validateObject(schema, obj, message);
};

export const validateOptions = <T extends object>(
  schema: Schema<T>,
  obj: Partial<T> | undefined,
  functionName: string
) => {
  const message = `Check the options of ${functionName}`;
  return validateObject(schema, obj, message);
};

const validateObject = <T extends object>(
  schema: Schema<T>,
  obj: T | undefined,
  message: string
) => {
  return schema.validate(obj, message);
};
