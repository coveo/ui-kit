import {describe, expect, it} from 'vitest';
import {NumberValue} from './number-value.js';

describe('number value', () => {
  let value: NumberValue;

  describe('calling validate', () => {
    it(`when passing a valid number
    it returns null`, () => {
      value = new NumberValue();
      expect(value.validate(-431)).toBeNull();
    });

    it('should do basic value validation', () => {
      value = new NumberValue({required: true});
      expect(value.validate(undefined!)).not.toBeNull();
    });

    it(`when a value is not required
    when passing an undefined value
    it returns null`, () => {
      value = new NumberValue({required: false});
      expect(value.validate(undefined!)).toBeNull();
    });

    it(`when not passing a number value
    it returns an error description`, () => {
      value = new NumberValue();
      expect(value.validate('a string' as unknown as number)).not.toBeNull();
    });

    it(`when passing NaN
    it returns an error description`, () => {
      value = new NumberValue();
      expect(value.validate(NaN)).not.toBeNull();
    });

    it(`when a minimum is defined
    passing a value that is under it returns an error description`, () => {
      value = new NumberValue({min: 5});
      expect(value.validate(4)).not.toBeNull();
    });

    it(`when a maximum is defined
    passing a value that is over it returns an error description`, () => {
      value = new NumberValue({max: 5});
      expect(value.validate(6)).not.toBeNull();
    });
  });
});
