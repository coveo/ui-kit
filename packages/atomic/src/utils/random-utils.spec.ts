import {afterEach, describe, expect, it, vi} from 'vitest';
import {getRandomArbitrary, randomID} from './random-utils';

describe('random utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

    it('should respect the provided length argument when no prefix is passed', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.987654321);

      const id = randomID(undefined, 8);

      expect(id).toHaveLength(8);
    });

    it('should respect the provided length argument when a prefix is passed', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.987654321);

      const id = randomID('pref-', 3);

      expect(id.startsWith('pref-')).toBe(true);
      expect(id.replace('pref-', '')).toHaveLength(3);
    });
  });

  describe('#getRandomArbitrary', () => {
    it('should produce the expected range', () => {
      const results = Array.from({length: 100}, () => getRandomArbitrary(5, 6));

      expect(results.every((value) => value >= 5 && value < 6)).toBe(true);
    });

    it('should calculate the value based on Math.random output', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.6);

      const value = getRandomArbitrary(10, 20);

      expect(value).toBe(16);
    });

    it('should return the minimum value when range is zero', () => {
      const value = getRandomArbitrary(7, 7);

      expect(value).toBe(7);
    });
  });
});
