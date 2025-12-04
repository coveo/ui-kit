import {beforeEach, describe, expect, it, vi} from 'vitest';
import {aggregate, isInDocument, once} from './utils';

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

  describe('#isInDocument', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should return true for an element attached to the main document', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      expect(isInDocument(el)).toBe(true);
      document.body.removeChild(el);
    });

    it('should return true for the descendant of an element attached to the main document', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      document.body.appendChild(parent);
      expect(isInDocument(child)).toBe(true);
    });

    it('should return true for an element inside a shadow DOM attached to the document', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);
      const shadow = host.attachShadow({mode: 'open'});
      const shadowChild = document.createElement('span');
      shadow.appendChild(shadowChild);
      expect(isInDocument(shadowChild)).toBe(true);
      document.body.removeChild(host);
    });

    it('should return false for an element not attached to the document', () => {
      const el = document.createElement('div');
      expect(isInDocument(el)).toBe(false);
    });
  });

  // TODO - KIT-4326:  add tests for all other functions exported from utils.ts.
});
