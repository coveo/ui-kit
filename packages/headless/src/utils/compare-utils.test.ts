import {
  arrayEqualStrictlyDifferentOrder,
  deepEqualAnyOrder,
} from './compare-utils.js';

describe('compare-utils', () => {
  describe('#deepEqualAnyOrder with an object containing primitive values', () => {
    const objectA = {
      a0: {
        a1: 'a',
        b1: 'b',
      },
      b0: {
        a1: 1,
        b1: 2,
      },
    };

    it(`when properties are of the same value & in the same order
      should return true`, () => {
      const objectB = {
        a0: {
          a1: 'a',
          b1: 'b',
        },
        b0: {
          a1: 1,
          b1: 2,
        },
      };
      expect(deepEqualAnyOrder(objectA, objectB)).toBe(true);
    });

    it(`when properties are of the same value but in a different order
      should return true`, () => {
      const objectB = {
        b0: {
          b1: 2,
          a1: 1,
        },
        a0: {
          b1: 'b',
          a1: 'a',
        },
      };
      expect(deepEqualAnyOrder(objectA, objectB)).toBe(true);
    });

    it(`when properties are of different values
      should return false`, () => {
      const objectB = {
        a0: {
          a1: 'f',
          b1: 'b',
        },
        b0: {
          f1: 1,
          b1: 3,
        },
      };
      expect(
        deepEqualAnyOrder(objectA, objectB as unknown as typeof objectA)
      ).toBe(false);
    });
  });

  describe('#deepEqualAnyOrder with a deep object containing an array of primitive values', () => {
    const objectA = {
      a0: {
        a1: ['c', 'x', 'b'],
      },
    };

    it(`when array values are the same & in the same order
    should return true`, () => {
      const objectB = {
        a0: {
          a1: ['c', 'x', 'b'],
        },
      };
      expect(deepEqualAnyOrder(objectA, objectB)).toBe(true);
    });

    it(`when array values are different
    should return false`, () => {
      const objectB = {
        a0: {
          a1: ['y', 'w', 'v'],
        },
      };
      expect(deepEqualAnyOrder(objectA, objectB)).toBe(false);
    });

    it(`when array values are the same & in a different order
    should return true`, () => {
      const objectB = {
        a0: {
          a1: ['b', 'c', 'x'],
        },
      };
      expect(deepEqualAnyOrder(objectA, objectB)).toBe(true);
    });
  });

  describe('#deepEqualAnyOrder with a deep object containing an array of objects', () => {
    const objectA = {
      a0: {
        a1: [
          {a2: ['t', 'c'], b2: 3},
          {a2: ['e', 'x'], b2: 40},
        ],
      },
    };

    it(`when array values are the same & in the same order
    should return true`, () => {
      const objectB = {
        a0: {
          a1: [
            {a2: ['t', 'c'], b2: 3},
            {a2: ['e', 'x'], b2: 40},
          ],
        },
      };
      expect(deepEqualAnyOrder(objectA, objectB)).toBe(true);
    });

    it(`when array values are different
    should return false`, () => {
      const objectB = {
        a0: {
          a1: [
            {a2: ['r', 'c'], b2: 8},
            {a2: ['e', 'f'], b2: 40},
          ],
        },
      };
      expect(deepEqualAnyOrder(objectA, objectB)).toBe(false);
    });

    it(`when array values are the same & in a different order
    should return true`, () => {
      const objectB = {
        a0: {
          a1: [
            {a2: ['x', 'e'], b2: 40},
            {b2: 3, a2: ['t', 'c']},
          ],
        },
      };
      expect(deepEqualAnyOrder(objectA, objectB)).toBe(true);
    });
  });

  describe('#arrayEqualStrictlyDifferentOrder with an array of primitive values', () => {
    const objectA = ['c', 'x', 'b'];

    it(`when arrays only have one identical value
      should return true`, () => {
      expect(arrayEqualStrictlyDifferentOrder(['a'], ['a'])).toBe(true);
    });

    it(`when arrays only have one value but different
      should return false`, () => {
      expect(arrayEqualStrictlyDifferentOrder(['a'], ['b'])).toBe(false);
    });

    it(`when array values are the same & in the same order
      should return false`, () => {
      const objectB = ['c', 'x', 'b'];
      expect(arrayEqualStrictlyDifferentOrder(objectA, objectB)).toBe(false);
    });

    it(`when array values are different
      should return false`, () => {
      const objectB = ['y', 'w', 'v'];
      expect(arrayEqualStrictlyDifferentOrder(objectA, objectB)).toBe(false);
    });

    it(`when array values are the same & in a different order
      should return true`, () => {
      const objectB = ['b', 'c', 'x'];
      expect(arrayEqualStrictlyDifferentOrder(objectA, objectB)).toBe(true);
    });

    it(`when first array contains duplicates and missing values regardless of the order
      should return false`, () => {
      const object1 = ['b', 'b', 'x'];
      const object2 = ['b', 'c', 'x'];
      expect(arrayEqualStrictlyDifferentOrder(object1, object2)).toBe(false);
    });

    it(`when second array contains duplicates and missing values regardless of the order
      should return false`, () => {
      const object1 = ['b', 'c', 'x'];
      const object2 = ['b', 'c', 'c'];
      expect(arrayEqualStrictlyDifferentOrder(object1, object2)).toBe(false);
    });
  });
});
