import {NumberValue} from '@coveo/bueno';
import {validatePayloadSchema, validatePayloadValue} from './validate-payload';

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
