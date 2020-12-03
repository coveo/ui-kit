import {NumberValue, Schema} from '@coveo/bueno';
import {Engine} from '../app/headless-engine';
import {buildMockSearchAppEngine} from '../test';
import {
  validatePayloadSchema,
  validatePayloadValue,
  validateOptions,
  validateInitialState,
} from './validate-payload';

describe('validatePayloadSchema', () => {
  const definition = {
    id: new NumberValue({max: 10}),
  };
  it(`when payload is valid
  should return the validated payload without error`, () => {
    const validatedPayload = validatePayloadSchema({id: 1}, definition);
    expect(validatedPayload.payload).toEqual({id: 1});
    expect(validatedPayload.error).toBeUndefined();
  });

  it(`when payload is invalid
  should return the validated payload with an error`, () => {
    const validatedPayload = validatePayloadSchema({id: 11}, definition);
    expect(validatedPayload.payload).toEqual({id: 11});
    expect(validatedPayload.error).toBeDefined();
  });

  it(`when payload is invalid
  when shouldThrowWhenInvalidated is "true"
  should throw an error`, () => {
    expect(() => validatePayloadSchema({id: 11}, definition, true)).toThrow();
  });
});

describe('validatePayloadValue', () => {
  const value = new NumberValue({max: 10});
  it(`when payload is valid
  should return the validated payload without error`, () => {
    const validatedPayload = validatePayloadValue(1, value);
    expect(validatedPayload.payload).toEqual(1);
    expect(validatedPayload.error).toBeUndefined();
  });

  it(`when payload is invalid
  should return the validated payload with an error`, () => {
    const validatedPayload = validatePayloadValue(11, value);
    expect(validatedPayload.payload).toEqual(11);
    expect(validatedPayload.error).toBeDefined();
  });

  it(`when payload is invalid
  when shouldThrowWhenInvalidated is "true"
  should throw an error`, () => {
    expect(() => validatePayloadValue(11, value, true)).toThrow();
  });
});

describe('validateOptions', () => {
  let engine: Engine<unknown>;
  const schema = new Schema({
    id: new NumberValue({max: 10}),
  });

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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
  let engine: Engine<unknown>;
  const schema = new Schema({
    id: new NumberValue({max: 10}),
  });

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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
