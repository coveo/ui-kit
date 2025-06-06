import {vi, beforeEach, describe, it, expect} from 'vitest';
import {
  once,
  camelToKebab,
  randomID,
  kebabToCamel,
  aggregate,
  isInDocument,
} from './utils';

describe('utils', () => {
  beforeEach(() => {
    vi.mock('./resource-url', async () => {
      return {
        getResourceUrl: vi.fn(() => new URL(import.meta.url).origin),
      };
    });
  });

  describe('#once', () => {
    it('should call the function only once', () => {
      const myFunction = vi.fn();
      const executeOnce = once(myFunction);
      executeOnce();
      executeOnce();
      expect(myFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('#camelToKebab', () => {
    it('works with a camel case value', () => {
      expect(camelToKebab('thisIsATest')).toBe('this-is-a-test');
    });

    it('works with a camel case value with numerical characters', () => {
      expect(camelToKebab('coolName2')).toBe('cool-name2');
    });

    it('works with an already kebab cased value', () => {
      expect(camelToKebab('fields-to-include')).toBe('fields-to-include');
    });
  });

  describe('#kebabToCamel', () => {
    it('works with a kebab case value', () => {
      expect(kebabToCamel('this-is-a-test')).toBe('thisIsATest');
    });

    it('works with a kebab case value with numerical characters', () => {
      expect(kebabToCamel('cool-name2')).toBe('coolName2');
    });

    it('works with an already camel cased value', () => {
      expect(kebabToCamel('fieldsToInclude')).toBe('fieldsToInclude');
    });
  });

  describe('#randomID', () => {
    it('when a string to prepend is passed, it places it at the start of the id', () => {
      expect(randomID('prefix')).toMatch(/^prefix/);
    });
    it('when a string to prepend is not passed, it prefixes id with nothing', () => {
      expect(randomID()).not.toMatch(/^undefined/);
      expect(randomID().length).toBe(5);
    });

    it('when called twice, it returns two different ids', () => {
      expect(randomID()).not.toBe(randomID());
    });
  });

  describe('#aggregate', () => {
    it('can aggregate based on string keys', () => {
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
    it('returns true for an element attached to the main document', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      expect(isInDocument(el)).toBe(true);
      document.body.removeChild(el);
    });

    it('returns false for an element not attached to the document', () => {
      const el = document.createElement('div');
      expect(isInDocument(el)).toBe(false);
    });

    it('returns true for an element inside a shadow DOM attached to the document', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);
      const shadow = host.attachShadow({mode: 'open'});
      const shadowChild = document.createElement('span');
      shadow.appendChild(shadowChild);
      expect(isInDocument(shadowChild)).toBe(true);
      document.body.removeChild(host);
    });

    it('returns false for an element inside a shadow DOM not attached to the document', () => {
      const host = document.createElement('div');
      const shadow = host.attachShadow({mode: 'open'});
      const shadowChild = document.createElement('span');
      shadow.appendChild(shadowChild);
      expect(isInDocument(shadowChild)).toBe(false);
    });
  });
});
