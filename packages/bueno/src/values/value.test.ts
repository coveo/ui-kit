import {describe, expect, it} from 'vitest';
import {Value} from './value.js';

describe('value', () => {
  let value: Value<unknown>;

  describe('calling validate', () => {
    it(`when required is false
    passing an undefined value returns null`, () => {
      value = new Value({required: false});
      expect(value.validate(undefined)).toBeNull();
    });

    it(`when required is true
    passing an undefined value returns an error description`, () => {
      value = new Value({required: true});
      expect(value.validate(undefined)).not.toBeNull();
    });
  });

  describe('calling default', () => {
    it(`when default is not defined
    should return undefined`, () => {
      value = new Value();
      expect(value.default).toBeUndefined();
    });

    it(`when default is a method
    should call the method to return the value`, () => {
      value = new Value({default: () => 'default'});
      expect(value.default).toBe('default');
    });

    it(`when default is not a method
    should simply return the value`, () => {
      value = new Value({default: 'default'});
      expect(value.default).toBe('default');
    });
  });
});
