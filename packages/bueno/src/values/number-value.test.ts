import {NumberValue} from './number-value';

describe('number value', () => {
  let value: NumberValue;

  describe('calling validate', () => {
    it('should do basic value validation', () => {
      value = new NumberValue({required: true});
      expect(() => value.validate(undefined!)).toThrow();
    });

    it(`when a minimum is defined
    passing a value that is under it will throw`, () => {
      value = new NumberValue({min: 5});
      expect(() => value.validate(4)).toThrow();
    });

    it(`when a maximum is defined
    passing a value that is over it will throw`, () => {
      value = new NumberValue({max: 5});
      expect(() => value.validate(6)).toThrow();
    });
  });
});
