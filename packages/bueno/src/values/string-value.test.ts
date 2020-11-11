import {StringValue} from './string-value';

describe('string value', () => {
  let value: StringValue;

  describe('calling validate', () => {
    it(`when passing a valid string (using primitive)
    it returns null`, () => {
      value = new StringValue();
      expect(value.validate('nice')).toBeNull();
    });

    it(`when passing a valid string (using object)
    it returns null`, () => {
      value = new StringValue();
      expect(value.validate(new String('allo') as string)).toBeNull();
    });

    it('should do basic value validation', () => {
      value = new StringValue({required: true});
      expect(value.validate(undefined!)).not.toBeNull();
    });

    it(`when a value is not required
    when passing an undefined value
    it returns null`, () => {
      value = new StringValue({required: false});
      expect(value.validate(undefined!)).toBeNull();
    });

    it(`when not passing a string value
    it returns an error description`, () => {
      value = new StringValue();
      expect(value.validate((123 as unknown) as string)).not.toBeNull();
    });

    it(`when emptyAllowed is false
    when passing an empty string value
    it returns an error description`, () => {
      value = new StringValue({emptyAllowed: false});
      expect(value.validate('')).not.toBeNull();
    });

    it(`when emptyAllowed is true (default)
    when passing an empty string value
    it returns null`, () => {
      value = new StringValue();
      expect(value.validate('')).toBeNull();
    });

    it(`when url is true
    when passing an invalid URL value
    it returns an error description`, () => {
      value = new StringValue({url: true});
      expect(value.validate('hello')).not.toBeNull();
    });

    it(`when url is true
    when passing a valid URL value
    it returns null`, () => {
      value = new StringValue({url: true});
      expect(value.validate('https://www.coveo.com?test=allo')).toBeNull();
    });

    it(`when constraining values are specified,
    when the value matches one of the values,
    it returns null`, () => {
      value = new StringValue({constrainTo: ['A', 'B']});
      expect(value.validate('B')).toBeNull();
    });

    it(`when constraining values are specified,
    when the value does not match any of the values,
    it returns an error description with the possible values`, () => {
      value = new StringValue({constrainTo: ['A', 'B']});
      expect(value.validate('C')).toContain('A, B.');
    });
  });
});
