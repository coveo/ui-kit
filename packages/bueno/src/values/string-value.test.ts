import {describe, expect, it} from 'vitest';
import {StringValue} from './string-value.js';

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
      expect(value.validate(123 as unknown as string)).not.toBeNull();
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

    describe('when url is true', () => {
      it.each(['hello', 'localhost', '127.0.0.1', '/relative/url'])(
        `when passing an invalid URL value of '%s'
      it returns an error description`,
        (url) => {
          value = new StringValue({url: true});
          expect(value.validate(url)).not.toBeNull();
        }
      );

      it.each([
        'https://www.coveo.com?test=allo',
        'https://www.example.org',
        'http://www.example.org',
        'http://localhost',
        'http://127.0.0.1',
        'localhost:1717',
      ])(
        `when passing a valid URL value of '%s'
      it returns null`,
        (url) => {
          value = new StringValue({url: true});
          expect(value.validate(url)).toBeNull();
        }
      );
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

    it(`when a regex is specified,
    if the value matches the regex,
    it returns null`, () => {
      value = new StringValue({regex: /ab/});
      expect(value.validate('ab')).toBeNull();
    });

    it(`when a regex is specified,
     if the value does not match the regex,
     it returns an error description with the regex`, () => {
      value = new StringValue({regex: /ab/});
      expect(value.validate('cd')).toContain('ab');
    });

    it(`when ISODate is true
      when passing an invalid date string
      it returns an error description`, () => {
      value = new StringValue({ISODate: true});
      expect(value.validate('hello')).not.toBeNull();
    });

    it(`when ISODate is true
      when passing a valid URL value
      it returns null`, () => {
      value = new StringValue({ISODate: true});
      expect(value.validate('2024-07-16T22:02:06.553Z')).toBeNull();
    });
  });
});
