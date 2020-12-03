import {NumberValue} from '@coveo/bueno';
import {validatePayload, validatePayloadAndThrow} from './validate-payload';

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
