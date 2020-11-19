import {
  fieldMustMatch,
  fieldMustNotMatch,
  fieldsMustBeDefined,
  fieldsMustNotBeDefined,
  getResultProperty,
} from './result-templates-helpers';
import {buildMockResult} from '../../test/mock-result';
import {buildMockRaw} from '../../test/mock-raw';

describe('result template helpers', () => {
  function buildResult(fieldName: string, fiedlValues: unknown) {
    return buildMockResult({
      raw: buildMockRaw({[fieldName]: fiedlValues}),
    });
  }

  describe('getResultProperty', () => {
    it('should return the result property at the root when it is defined', () => {
      const result = buildMockResult();
      result.title = 'my_title';
      expect(getResultProperty(result, 'title')).toBe('my_title');
    });

    it('should return the result property from the "raw" object when not defined at the root', () => {
      const result = buildMockResult();
      result.raw.new_property = 'my_field_value';
      expect(getResultProperty(result, 'new_property')).toBe('my_field_value');
    });

    it('should return null when the property is not defined at all', () => {
      expect(getResultProperty(buildMockResult(), 'doesnt_exist')).toBeNull();
    });
  });

  describe('fieldsMustBeDefined', () => {
    it(`when sending a list of fields that are all defined in the result
    should return true`, () => {
      const match = fieldsMustBeDefined(['language', 'anotherfield']);
      const result = buildMockResult();
      result.raw['language'] = ['Test'];
      result.raw['anotherfield'] = 0;
      expect(match(result)).toBe(true);
    });

    it(`when sending a list of fields that are not all defined in the result
    should return false`, () => {
      const match = fieldsMustBeDefined(['language', 'anotherfield']);
      const result = buildMockResult();
      result.raw['language'] = ['Test'];
      expect(match(result)).toBe(false);
    });
  });

  describe('fieldsMustNotBeDefined', () => {
    it(`when sending a list of fields that are all undefined in the result
    should return true`, () => {
      const match = fieldsMustNotBeDefined(['somefield', 'anotherfield']);
      const result = buildMockResult();
      result.raw['anotherfield'] = undefined;
      expect(match(result)).toBe(true);
    });

    it(`when sending a list of fields that are not undefined in the result
    should return false`, () => {
      const match = fieldsMustNotBeDefined(['somefield', 'anotherfield']);
      const result = buildMockResult();
      result.raw['anotherfield'] = 0;
      expect(match(result)).toBe(false);
    });
  });

  describe('fieldMustMatch', () => {
    it(`when sending a field that contains one of the values to match
    should return true`, () => {
      const match = fieldMustMatch('language', ['French', 'English']);
      const result = buildResult('language', 'English');
      expect(match(result)).toBe(true);
    });

    it(`when sending a field that does not contains any of the values to match
    should return false`, () => {
      const match = fieldMustMatch('language', ['French', 'English']);
      const result = buildResult('language', 'Spanish');
      expect(match(result)).toBe(false);
    });

    it(`when sending a field that contains multiple values
    when at least one value matches the value(s) sent
    should return true`, () => {
      const match = fieldMustMatch('language', ['English', 'French']);
      const result = buildResult('language', ['Korean', 'French']);
      expect(match(result)).toBe(true);
    });

    it('should work with different casings', () => {
      const match = fieldMustMatch('language', ['french']);
      const result = buildResult('language', 'FRENCH');
      expect(match(result)).toBe(true);
    });

    it('should work with fields containing numerical values', () => {
      const match = fieldMustMatch('rowid', ['12']);
      const result = buildResult('rowid', 12);
      expect(match(result)).toBe(true);
    });
  });

  describe('fieldMustNotMatch', () => {
    it(`when sending a field that does not contain any of the values to match
    should return true`, () => {
      const match = fieldMustNotMatch('language', ['English', 'French']);
      const result = buildResult('language', 'Arabic');
      expect(match(result)).toBe(true);
    });

    it(`when sending a field that contains any of the values to match
    should return false`, () => {
      const match = fieldMustNotMatch('language', ['English', 'French']);
      const result = buildResult('language', 'French');
      expect(match(result)).toBe(false);
    });

    it(`when sending a field that contains multiple values
    when at least one of those values matches the value(s) sent
    should return false`, () => {
      const match = fieldMustNotMatch('language', [
        'English',
        'Korean',
        'Arabic',
      ]);
      const result = buildResult('language', ['French', 'Arabic']);
      expect(match(result)).toBe(false);
    });

    it('should work with different casings', () => {
      const match = fieldMustNotMatch('language', ['french']);
      const result = buildResult('language', 'FRENCH');
      expect(match(result)).toBe(false);
    });

    it('should work with fields containing numerical values', () => {
      const match = fieldMustNotMatch('rowid', ['12']);
      const result = buildResult('rowid', 12);
      expect(match(result)).toBe(false);
    });
  });
});
