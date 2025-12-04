import {describe, expect, it, vi} from 'vitest';
import {aggregate, once} from './utils';

describe('utils', () => {
  describe('#once', () => {
    it('should call the function only once', () => {
      const myFunction = vi.fn();
      const executeOnce = once(myFunction);
      executeOnce();
      executeOnce();
      expect(myFunction).toHaveBeenCalledTimes(1);
    });

    it('should support arguments', () => {
      const fn = (num: number, str: string) => {
        return num * 10 + str.length;
      };
      const fnOnce = once(fn);
      const result = fnOnce(5, 'test');

      expect(result).toBe(54);
    });

    it('should ignore arguments if called additional times', () => {
      const fn = (num: number, str: string) => {
        return num * 10 + str.length;
      };
      const fnOnce = once(fn);
      const result = fnOnce(5, 'test');
      const result2 = fnOnce(2, 't');

      expect(result).toBe(54);
      expect(result2).toBe(54);
    });

    it('should support void functions', () => {
      const fn = (): void => {};
      const fnOnce = once(fn);
      const result: unknown = fnOnce();

      expect(result).toBeUndefined();
    });

    it('should support typed functions', () => {
      const fn = () => {
        return 123;
      };
      const fnOnce = once(fn);
      const result: number = fnOnce();

      expect(result).toBe(123);
    });
  });

  describe('#aggregate', () => {
    it('should aggregate based on string keys', () => {
      const aggregatedValues = aggregate(
        [
          {name: 'Apple', category: 'Fruit'},
          {name: 'Cookie', category: 'Dessert'},
          {name: 'Watermelon', category: 'Fruit'},
          {name: 'Carrot', category: 'Vegetable'},
        ] as const,
        (value) => value.category
      );
      expect(aggregatedValues).toEqual({
        Fruit: [
          {name: 'Apple', category: 'Fruit'},
          {name: 'Watermelon', category: 'Fruit'},
        ],
        Dessert: [{name: 'Cookie', category: 'Dessert'}],
        Vegetable: [{name: 'Carrot', category: 'Vegetable'}],
      });
    });
  });

  // TODO - KIT-4326:  add tests for all other functions exported from utils.ts.
});
