import {deepObjectEqualUnsorted} from './compare-utils';

describe('deepObjectEqualUnsorted', () => {
  describe('with an object containing primitive values', () => {
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
      expect(deepObjectEqualUnsorted(objectA, objectB)).toBe(true);
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
      expect(deepObjectEqualUnsorted(objectA, objectB)).toBe(true);
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
      expect(deepObjectEqualUnsorted(objectA, objectB)).toBe(false);
    });
  });

  describe('with a deep object containing an array of primitive values', () => {
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
      expect(deepObjectEqualUnsorted(objectA, objectB)).toBe(true);
    });

    it(`when array values are different
    should return false`, () => {
      const objectB = {
        a0: {
          a1: ['y', 'w', 'v'],
        },
      };
      expect(deepObjectEqualUnsorted(objectA, objectB)).toBe(false);
    });

    it(`when array values are the same & in a different order
    should return true`, () => {
      const objectB = {
        a0: {
          a1: ['b', 'c', 'x'],
        },
      };
      expect(deepObjectEqualUnsorted(objectA, objectB)).toBe(true);
    });
  });

  describe('with a deep object containing an array of objects', () => {
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
      expect(deepObjectEqualUnsorted(objectA, objectB)).toBe(true);
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
      expect(deepObjectEqualUnsorted(objectA, objectB)).toBe(false);
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
      expect(deepObjectEqualUnsorted(objectA, objectB)).toBe(true);
    });
  });
});
