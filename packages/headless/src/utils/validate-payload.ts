import {
  SchemaDefinition,
  SchemaValue,
  Schema,
  SchemaValidationError,
} from '@coveo/bueno';
import {Engine} from '../app/headless-engine';

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
      }).validate({value: payload}).value as P,
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
): {payload: P; error?: SchemaValidationError} => {
  try {
    return validatePayloadAndThrow(payload, definition);
  } catch (error) {
    return {payload, error: error as SchemaValidationError};
  }
};

export const validateInitialState = <T extends object>(
  engine: Engine<unknown>,
  schema: Schema<T>,
  obj: T | undefined,
  functionName: string
) => {
  const message = `Check the initialState of ${functionName}`;
  return validateObject(engine, schema, obj, message);
};

export const validateOptions = <T extends object>(
  engine: Engine<unknown>,
  schema: Schema<T>,
  obj: Partial<T> | undefined,
  functionName: string
) => {
  const message = `Check the options of ${functionName}`;
  return validateObject(engine, schema, obj, message);
};

const validateObject = <T extends object>(
  engine: Engine<unknown>,
  schema: Schema<T>,
  obj: T | undefined,
  message: string
) => {
  try {
    return schema.validate(obj, message);
  } catch (error) {
    engine.logger.error(error, 'Controller initialization error');
    throw error;
  }
};
