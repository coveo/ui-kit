import {
  SchemaDefinition,
  SchemaValue,
  Schema,
  SchemaValidationError,
} from '@coveo/bueno';

/**
 * Validates an action payload and throws an error if invalid
 * @param payload the action payload
 * @param definition Either a Bueno SchemaDefinition or a SchemaValue
 */
export const validatePayloadAndThrow = <P>(
  payload: P,
  definition: SchemaDefinition<Required<P>> | SchemaValue<P>
) => {
  const isSchemaValue = 'required' in definition;
  if (isSchemaValue) {
    return {
      payload: new Schema({
        value: definition as SchemaValue<P>,
      }).validate(payload) as P,
    };
  }

  return {
    payload: new Schema(definition as SchemaDefinition<Required<P>>).validate(
      payload
    ) as P,
  };
};

/**
 * Validates an action payload and return an `error` alongside the payload if it's invalid
 * @param payload the action payload
 * @param definition Either a Bueno SchemaDefinition or a SchemaValue
 */
export const validatePayload = <P>(
  payload: P,
  definition: SchemaDefinition<Required<P>> | SchemaValue<P>
) => {
  try {
    return validatePayloadAndThrow(payload, definition);
  } catch (error) {
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
