import {describe, expect, it} from 'vitest';
import {
  ArrayValue,
  BooleanValue,
  isArray,
  isNullOrUndefined,
  isString,
  isUndefined,
  NumberValue,
  Schema,
  SchemaValidationError,
  StringValue,
} from './bueno-zod';

describe('bueno-zod compatibility', () => {
  describe('NumberValue', () => {
    it('should validate numbers', () => {
      const numberValue = new NumberValue({min: 1, max: 10});
      expect(numberValue.validate(5)).toBeNull();
    });

    it('should reject values below min', () => {
      const numberValue = new NumberValue({min: 1});
      expect(numberValue.validate(0)).toContain('minimum value');
    });

    it('should reject values above max', () => {
      const numberValue = new NumberValue({max: 10});
      expect(numberValue.validate(11)).toContain('maximum value');
    });

    it('should handle required values', () => {
      const numberValue = new NumberValue({required: true});
      expect(numberValue.validate(undefined as never)).toContain('required');
    });
  });

  describe('StringValue', () => {
    it('should validate strings', () => {
      const stringValue = new StringValue();
      expect(stringValue.validate('test')).toBeNull();
    });

    it('should validate constrained strings', () => {
      const stringValue = new StringValue({
        constrainTo: ['foo', 'bar'] as const,
      });
      expect(stringValue.validate('foo')).toBeNull();
      expect(stringValue.validate('baz' as never)).toContain(
        'should be one of'
      );
    });

    it('should validate URLs', () => {
      const stringValue = new StringValue({url: true});
      expect(stringValue.validate('https://example.com')).toBeNull();
      expect(stringValue.validate('not a url' as never)).toContain('valid URL');
    });
  });

  describe('BooleanValue', () => {
    it('should validate booleans', () => {
      const booleanValue = new BooleanValue();
      expect(booleanValue.validate(true)).toBeNull();
      expect(booleanValue.validate(false)).toBeNull();
    });

    it('should reject non-booleans', () => {
      const booleanValue = new BooleanValue();
      expect(booleanValue.validate('true' as never)).toContain('not a boolean');
    });
  });

  describe('ArrayValue', () => {
    it('should validate arrays', () => {
      const arrayValue = new ArrayValue({min: 1, max: 5});
      expect(arrayValue.validate([1, 2, 3])).toBeNull();
    });

    it('should validate array length', () => {
      const arrayValue = new ArrayValue({min: 2});
      expect(arrayValue.validate([1])).toContain('less than');
    });
  });

  describe('Schema', () => {
    it('should validate objects', () => {
      const schema = new Schema({
        name: new StringValue({required: true}),
        age: new NumberValue({min: 0}),
      });

      expect(() => schema.validate({name: 'John', age: 30})).not.toThrow();
    });

    it('should throw SchemaValidationError on invalid data', () => {
      const schema = new Schema({
        name: new StringValue({required: true}),
        age: new NumberValue({min: 0, required: true}),
      });

      expect(() => schema.validate({})).toThrow(SchemaValidationError);
    });

    it('should apply default values', () => {
      const schema = new Schema({
        name: new StringValue({default: 'Default'}),
        count: new NumberValue({default: 0}),
      });

      const result = schema.validate({});
      expect(result.name).toBe('Default');
      expect(result.count).toBe(0);
    });
  });

  describe('utility functions', () => {
    it('isNullOrUndefined should work', () => {
      expect(isNullOrUndefined(null)).toBe(true);
      expect(isNullOrUndefined(undefined)).toBe(true);
      expect(isNullOrUndefined(0)).toBe(false);
      expect(isNullOrUndefined('')).toBe(false);
    });

    it('isUndefined should work', () => {
      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
    });

    it('isArray should work', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray('string')).toBe(false);
      expect(isArray(null)).toBe(false);
    });

    it('isString should work', () => {
      expect(isString('test')).toBe(true);
      expect(isString(new String('test'))).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
    });
  });
});
