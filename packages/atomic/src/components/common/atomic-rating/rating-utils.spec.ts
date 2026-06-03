import {describe, expect, it} from 'vitest';
import {FieldValueIsNaNError} from '@/src/components/commerce/product-template-component-utils/error';
import {computeNumberOfStars} from './rating-utils';

describe('rating-utils', () => {
  describe('#computeNumberOfStars', () => {
    it('should return number for valid numeric value', () => {
      const result = computeNumberOfStars(4.5, 'rating');

      expect(result).toBe(4.5);
    });

    it('should return number for string numeric value', () => {
      const result = computeNumberOfStars('3.2', 'rating');

      expect(result).toBe(3.2);
    });

    it('should return null for null value', () => {
      const result = computeNumberOfStars(null, 'rating');

      expect(result).toBe(null);
    });

    it('should throw FieldValueIsNaNError for non-numeric string', () => {
      expect(() => computeNumberOfStars('not-a-number', 'rating')).toThrow(
        FieldValueIsNaNError
      );
    });

    it('should throw FieldValueIsNaNError for undefined value', () => {
      expect(() => computeNumberOfStars(undefined, 'rating')).toThrow(
        FieldValueIsNaNError
      );
    });

    it('should include the field name and value in the error', () => {
      expect(() => computeNumberOfStars('invalid', 'custom_field')).toThrow(
        new FieldValueIsNaNError('custom_field', 'invalid')
      );
    });
  });
});
