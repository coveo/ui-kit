import {NumberValue, Schema, SchemaValidationError} from '@coveo/bueno';
import {CoreEngine} from '../app/engine';
import {buildMockSearchEngine} from '../test/mock-engine-v2';
import {createMockState} from '../test/mock-state';
import {
  validatePayload,
  validatePayloadAndThrow,
  validateOptions,
  validateInitialState,
  serializeSchemaValidationError,
} from './validate-payload';

const definition = {
  id: new NumberValue({max: 10}),
};
const value = new NumberValue({max: 10});

describe('validatePayload', () => {
  it(`when SchemaDefinition payload is valid
  should return the validated payload without error`, () => {
    const validatedPayload = validatePayload({id: 1}, definition);
    expect(validatedPayload.payload).toEqual({id: 1});
    expect(validatedPayload.error).toBeUndefined();
  });

  it(`when SchemaDefinition payload is invalid
  should return the validated payload with an error`, () => {
    const validatedPayload = validatePayload({id: 11}, definition);
    expect(validatedPayload.payload).toEqual({id: 11});
    expect(validatedPayload.error).toBeDefined();
  });

  it(`when SchemaValue payload is valid
  should return the validated payload without error`, () => {
    const validatedPayload = validatePayload(1, value);
    expect(validatedPayload.payload).toEqual(1);
    expect(validatedPayload.error).toBeUndefined();
  });

  it(`when SchemaValue payload is invalid
  should return the validated payload with an error`, () => {
    const validatedPayload = validatePayload(11, value);
    expect(validatedPayload.payload).toEqual(11);
    expect(validatedPayload.error).toBeDefined();
  });

  it('when SchemaDefinition is an object, validating a payload that is not an object should be invalid', () => {
    const notAnObject = ['foo', 11, true];
    for (const testCase in notAnObject) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validatedPayload = validatePayload(testCase, definition as any);
      expect(validatedPayload.payload).toEqual(testCase);
      expect(validatedPayload.error).toBeDefined();
    }
  });
});

describe('validatePayloadAndThrow', () => {
  it(`when SchemaDefinition payload is invalid
    should throw an error`, () => {
    expect(() => validatePayloadAndThrow({id: 11}, definition)).toThrow();
  });

  it(`when SchemaValue payload is invalid
  should throw an error`, () => {
    expect(() => validatePayloadAndThrow(11, value)).toThrow();
  });
});

describe('validateOptions', () => {
  let engine: CoreEngine;
  const schema = new Schema({
    id: new NumberValue({max: 10}),
  });

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
  });

  it(`when options are valid
  should return the validated options without error`, () => {
    const validatedOptions = validateOptions(
      engine,
      schema,
      {id: 1},
      'someFunction'
    );
    expect(validatedOptions.id).toEqual(1);
  });

  it(`when options are invalid
  should throw`, () => {
    expect(() =>
      validateOptions(engine, schema, {id: 11}, 'someFunction')
    ).toThrow();
  });
});

describe('validateInitialState', () => {
  let engine: CoreEngine;
  const schema = new Schema({
    id: new NumberValue({max: 10}),
  });

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
  });

  it(`when initial state is valid
  should return the validated options without error`, () => {
    const validatedInitialState = validateInitialState(
      engine,
      schema,
      {id: 1},
      'someFunction'
    );
    expect(validatedInitialState.id).toEqual(1);
  });

  it(`when initial state is invalid
  should throw`, () => {
    expect(() =>
      validateInitialState(engine, schema, {id: 11}, 'someFunction')
    ).toThrow();
  });
});

describe('serializeSchemaValidationError', () => {
  it('should serialize error correctly', () => {
    const error = new SchemaValidationError('Hello');
    expect(serializeSchemaValidationError(error)).toEqual({
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
  });
});
