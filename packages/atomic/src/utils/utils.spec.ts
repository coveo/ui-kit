import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  aggregate,
  camelToKebab,
  isInDocument,
  kebabToCamel,
  once,
  randomID,
} from './utils';

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

  describe('#camelToKebab', () => {
    it('should work with a camel case value', () => {
      expect(camelToKebab('thisIsATest')).toBe('this-is-a-test');
    });

    it('should work with a camel case value with numerical characters', () => {
      expect(camelToKebab('coolName2')).toBe('cool-name2');
    });

    it('should work with an already kebab cased value', () => {
      expect(camelToKebab('fields-to-include')).toBe('fields-to-include');
    });
  });

  describe('#kebabToCamel', () => {
    it('should work with a kebab case value', () => {
      expect(kebabToCamel('this-is-a-test')).toBe('thisIsATest');
    });

    it('should work with a kebab case value with numerical characters', () => {
      expect(kebabToCamel('cool-name2')).toBe('coolName2');
    });

    it('should work with an already camel cased value', () => {
      expect(kebabToCamel('fieldsToInclude')).toBe('fieldsToInclude');
    });
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
