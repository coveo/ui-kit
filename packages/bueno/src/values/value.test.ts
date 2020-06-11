import {Value} from './value';

describe('value', () => {
  let value: Value<unknown>;

  describe('calling validate', () => {
    it(`when required is false
    passing an undefined value will not throw`, () => {
      value = new Value({required: false});
      expect(() => value.validate(undefined)).not.toThrow();
    });

    it(`when required is true
    passing an undefined value will throw`, () => {
      value = new Value({required: true});
      expect(() => value.validate(undefined)).toThrow();
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
