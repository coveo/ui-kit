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
  });
});
