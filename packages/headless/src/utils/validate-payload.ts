import {z} from '@coveo/bueno/zod';
import type {SerializedError} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../app/engine.js';

// --- Pre-built schemas ---

export const requiredNonEmptyString = z.string().check(z.minLength(1));
export const nonEmptyString = z.optional(z.string().check(z.minLength(1)));
export const requiredEmptyAllowedString = z.string();
export const nonRequiredEmptyAllowedString = z.optional(z.string());

export const nonEmptyStringArray = z.array(z.string().check(z.minLength(1)));

export const optionalNonEmptyVersionString = z.optional(
  z.string().check(z.regex(/^\d+\.\d+\.\d+$/))
);
export const optionalTrackingId = z.optional(
  z.string().check(z.minLength(1), z.regex(/^[a-zA-Z0-9_\-.]{1,100}$/))
);
export const requiredTrackingId = z
  .string()
  .check(z.minLength(1), z.regex(/^[a-zA-Z0-9_\-.]{1,100}$/));

// --- Error serialization ---

export const serializeSchemaValidationError = (
  error: z.core.$ZodError | Error
): SerializedError => ({
  message: error.message,
  name: error.name,
  stack: error.stack,
});

// --- Payload validation ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodSchema = z.ZodMiniType<any>;

export const validatePayloadAndThrow = <P>(
  payload: P,
  schema: AnyZodSchema
): {payload: P} => {
  schema.parse(payload);
  return {payload};
};

export const validatePayload = <P>(
  payload: P,
  schema: AnyZodSchema
): {payload: P; error?: SerializedError} => {
  const result = schema.safeParse(payload);
  if (result.success) {
    return {payload};
  }
  return {
    payload,
    error: serializeSchemaValidationError(result.error),
  };
};

// --- Controller option/state validation ---

export const validateInitialState = <T extends object>(
  engine: CoreEngine | CoreEngineNext,
  schema: AnyZodSchema,
  obj: T | undefined,
  functionName: string
): T | undefined => {
  const message = `Check the initialState of ${functionName}`;
  return validateObject(
    engine,
    schema,
    obj,
    message,
    'Controller initialization error'
  );
};

export const validateOptions = <T extends object>(
  engine: CoreEngine<object> | CoreEngineNext<object>,
  schema: AnyZodSchema,
  obj: Partial<T> | undefined,
  functionName: string
): T | undefined => {
  const message = `Check the options of ${functionName}`;
  return validateObject(
    engine,
    schema,
    obj as T | undefined,
    message,
    'Controller initialization error'
  );
};

const validateObject = <T extends object>(
  engine: CoreEngine<object> | CoreEngineNext<object>,
  schema: AnyZodSchema,
  obj: T | undefined,
  validationMessage: string,
  errorMessage: string
): T | undefined => {
  if (obj === undefined) {
    return undefined;
  }
  try {
    schema.parse(obj);
    return obj;
  } catch (error) {
    const wrappedError = new Error(
      `${validationMessage}: ${(error as z.core.$ZodError).message}`
    );
    engine.logger.error(wrappedError, errorMessage);
    throw wrappedError;
  }
};
