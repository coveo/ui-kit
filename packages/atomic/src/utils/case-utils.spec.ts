import {describe, expect, it} from 'vitest';
import {
  camelToKebab,
  kebabToCamel,
  snakeToCamel,
  titleToKebab,
} from './case-utils';

describe('case-utils', () => {
  describe('#camelToKebab', () => {
    it('should convert camel case to kebab case', () => {
      expect(camelToKebab('thisIsATest')).toBe('this-is-a-test');
    });

    it('should handle camel case values with numerical characters', () => {
      expect(camelToKebab('coolName2')).toBe('cool-name2');
    });

    it('should leave existing kebab case values unchanged', () => {
      expect(camelToKebab('fields-to-include')).toBe('fields-to-include');
    });
  });

  describe('#kebabToCamel', () => {
    it('should convert kebab case to camel case', () => {
      expect(kebabToCamel('this-is-a-test')).toBe('thisIsATest');
    });

    it('should handle kebab case values with numerical characters', () => {
      expect(kebabToCamel('cool-name2')).toBe('coolName2');
    });

    it('should leave existing camel case values unchanged', () => {
      expect(kebabToCamel('fieldsToInclude')).toBe('fieldsToInclude');
    });
  });

  describe('#snakeToCamel', () => {
    it('should convert snake case to camel case', () => {
      expect(snakeToCamel('this_is_a_test')).toBe('thisIsATest');
    });

    it('should normalize uppercase characters before converting', () => {
      expect(snakeToCamel('COOL_NAME')).toBe('coolName');
    });
  });

  describe('#titleToKebab', () => {
    it('should convert a title to kebab case', () => {
      expect(titleToKebab('This Is A Test')).toBe('this-is-a-test');
    });

    it('should collapse multiple spaces into single hyphens', () => {
      expect(titleToKebab('Value   Example')).toBe('value---example');
    });
  });
});
