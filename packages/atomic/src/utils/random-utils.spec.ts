import {describe, expect, it} from 'vitest';
import {getRandomArbitrary, randomID} from './random-utils';

describe('random utils', () => {
  describe('#randomID', () => {
    it('should place the string to prepend at the start of the id when passed', () => {
      expect(randomID('prefix')).toMatch(/^prefix/);
    });

    it('should prefix id with nothing when a string to prepend is not passed', () => {
      expect(randomID()).not.toMatch(/^undefined/);
      expect(randomID().length).toBe(5);
    });

    it('should return two different ids when called twice', () => {
      expect(randomID()).not.toBe(randomID());
    });
  });

  describe('#getRandomArbitrary', () => {
    it('should produce the expected range', () => {
      const results = Array.from({length: 100}, () => getRandomArbitrary(5, 6));

      expect(results.every((value) => value >= 5 && value < 6)).toBe(true);
    });
  });
});
