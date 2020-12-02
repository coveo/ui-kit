import {
  SchemaDefinition,
  SchemaValue,
  Schema,
  SchemaValidationError,
} from '@coveo/bueno';

export const validatePayloadSchema = <P>(
  payload: P,
  schemaDefinition: SchemaDefinition<Required<P>>,
  shouldThrowWhenInvalidated = false
) => {
  const schema = new Schema(schemaDefinition);
  try {
    const validatedPayload = schema.validate(payload);
    return {payload: validatedPayload as P};
  } catch (error) {
    if (shouldThrowWhenInvalidated) {
      throw error;
    }
    return {payload, error: error as SchemaValidationError};
  }
};

export const validatePayloadValue = <P>(
  payload: P,
  schemaValue: SchemaValue<P>,
  shouldThrowWhenInvalidated = false
) => {
  const schema = new Schema({value: schemaValue});
  try {
    const validatedPayload = schema.validate({value: payload}).value;
    return {payload: validatedPayload as P};
  } catch (error) {
    if (shouldThrowWhenInvalidated) {
      throw error;
    }
    return {payload, error: error as SchemaValidationError};
  }
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
