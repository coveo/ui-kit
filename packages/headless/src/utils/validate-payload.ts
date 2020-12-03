import {
  SchemaDefinition,
  SchemaValue,
  Schema,
  SchemaValidationError,
} from '@coveo/bueno';

const validatePayload = <P>(
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

export const validateActionPayload = <P>(
  payload: P,
  definition: SchemaDefinition<Required<P>> | SchemaValue<P>
) => {
  try {
    return validatePayload(payload, definition);
  } catch (error) {
    return {payload, error: error as SchemaValidationError};
  }
};

export const validateThunkActionPayload = <P>(
  payload: P,
  definition: SchemaDefinition<Required<P>> | SchemaValue<P>
) => {
  return validatePayload(payload, definition);
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
