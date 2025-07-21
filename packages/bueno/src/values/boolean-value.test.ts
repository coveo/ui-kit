import {describe, expect, it} from 'vitest';
import {BooleanValue} from './boolean-value.js';

describe('boolean value', () => {
  let value: BooleanValue;

  describe('calling validate', () => {
    it(`when passing a valid boolean
    it returns null`, () => {
      value = new BooleanValue();
      expect(value.validate(true)).toBeNull();
    });

    it('should do basic value validation', () => {
      value = new BooleanValue({required: true});
      expect(value.validate(undefined!)).not.toBeNull();
    });

    it(`when a value is not required
    when passing an undefined value
    it returns null`, () => {
      value = new BooleanValue({required: false});
      expect(value.validate(undefined!)).toBeNull();
    });

    it(`when not passing a boolean value
    it returns an error description`, () => {
      value = new BooleanValue();
      expect(value.validate('a string' as unknown as boolean)).not.toBeNull();
    });
  });
});
