import {computeNumberOfStars} from './atomic-rating';

describe('#computeNumberOfStars', () => {
  test('should return null when value is null', () => {
    const value = null;
    const field = 'rating';

    const result = computeNumberOfStars(value, field);

    expect(result).toBeNull();
  });

  test('should parse value as a number', () => {
    const value = '4.5';
    const field = 'rating';

    const result = computeNumberOfStars(value, field);

    expect(result).toBe(4.5);
  });

  test('should throw an error when value is not a number', () => {
    const value = 'invalid';
    const field = 'rating';

    expect(() => {
      computeNumberOfStars(value, field);
    }).toThrowErrorMatchingSnapshot();
  });
});
