import {
  SchemaDefinition,
  SchemaValue,
  Schema,
  SchemaValidationError,
  StringValue,
  RecordValue,
  ArrayValue,
} from '@coveo/bueno';
import {SerializedError} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../app/engine';
import {stateKey} from '../app/state-key';

export const requiredNonEmptyString = new StringValue({
  required: true,
  emptyAllowed: false,
});

export const nonEmptyString = new StringValue({
  required: false,
  emptyAllowed: false,
});

export const requiredEmptyAllowedString = new StringValue({
  required: true,
  emptyAllowed: true,
});

export const nonRequiredEmptyAllowedString = new StringValue({
  required: false,
  emptyAllowed: true,
});

export const nonEmptyStringArray = new ArrayValue({
  each: requiredNonEmptyString,
  required: true,
});

export const optionalNonEmptyVersionString = new StringValue({
  required: false,
  emptyAllowed: false,
  regex: /^\d+\.\d+\.\d+$/,
});

export const serializeSchemaValidationError = ({
  message,
  name,
  stack,
}: SchemaValidationError): SerializedError => ({message, name, stack});

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

  const asRecordValue = new RecordValue({
    options: {required: true},
    values: definition as SchemaDefinition<Record<string, Object>>,
  });

  const isInvalid = asRecordValue.validate(payload);
  if (isInvalid) {
    throw new SchemaValidationError(isInvalid);
  }
  return {payload};
};

/**
 * Validates an action payload and return an `error` alongside the payload if it's invalid
 * @param payload the action payload
 * @param definition Either a Bueno SchemaDefinition or a SchemaValue
 */
export const validatePayload = <P>(
  payload: P,
  definition: SchemaDefinition<Required<P>> | SchemaValue<P>
): {payload: P; error?: SerializedError} => {
  try {
    return validatePayloadAndThrow(payload, definition);
  } catch (error) {
    return {
      payload,
      error: serializeSchemaValidationError(error as Error),
    };
  }
};

export const validateInitialState = <T extends object>(
  engine: CoreEngine,
  schema: Schema<T>,
  obj: T | undefined,
  functionName: string
) => {
  const message = `Check the initialState of ${functionName}`;
  return validateObject(
    engine,
    schema,
    obj,
    message,
    'Controller initialization error'
  );
};

export const validateInitialStateNext = <T extends object>(
  engine: CoreEngineNext,
  schema: Schema<T>,
  obj: T | undefined,
  functionName: string
) => {
  const message = `Check the initialState of ${functionName}`;
  return validateObject(
    {
      ...engine,
      get state() {
        return engine[stateKey];
      },
    },
    schema,
    obj,
    message,
    'Controller initialization error'
  );
};

export const validateOptions = <T extends object>(
  engine: CoreEngine<object>,
  schema: Schema<T>,
  obj: Partial<T> | undefined,
  functionName: string
) => {
  const message = `Check the options of ${functionName}`;
  return validateObject(
    engine,
    schema,
    obj,
    message,
    'Controller initialization error'
  );
};

export const validateOptionsNext = <T extends object>(
  engine: CoreEngineNext<object>,
  schema: Schema<T>,
  obj: Partial<T> | undefined,
  functionName: string
) => {
  return validateOptions(
    {
      ...engine,
      get state() {
        return engine[stateKey];
      },
    },
    schema,
    obj,
    functionName
  );
};

const validateObject = <T extends object>(
  engine: CoreEngine<object>,
  schema: Schema<T>,
  obj: T | undefined,
  validationMessage: string,
  errorMessage: string
) => {
  try {
    return schema.validate(obj, validationMessage);
  } catch (error) {
    engine.logger.error(error as Error, errorMessage);
    throw error;
  }
};
