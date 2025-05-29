import {vi, describe, it, expect} from 'vitest';
import {parseAssetURL} from './stencil-utils';
import {once, camelToKebab, randomID, kebabToCamel, aggregate} from './utils';

vi.mock('@stencil/core', () => ({
  getAssetPath: vi.fn((path: string) => {
    return path.replace('./', '/');
  }),
}));

describe('once', () => {
  it('should call the function only once', () => {
    const myFunction = vi.fn();
    const executeOnce = once(myFunction);
    executeOnce();
    executeOnce();
    expect(myFunction).toHaveBeenCalledTimes(1);
  });
});

describe('camelToKebab', () => {
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

describe('kebabToCamel', () => {
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

describe('randomID', () => {
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

describe('parseAssetURL', () => {
  it('works with relative urls', () => {
    expect(parseAssetURL('../test.svg')).toBe('../test.svg');
    expect(parseAssetURL('./test.svg')).toBe('./test.svg');
  });

  it('works with the http(s) protocol urls', () => {
    expect(parseAssetURL('https://github.com/coveo/ui-kit/test.svg')).toBe(
      'https://github.com/coveo/ui-kit/test.svg'
    );
    expect(parseAssetURL('http://github.com/coveo/ui-kit/test.svg')).toBe(
      'http://github.com/coveo/ui-kit/test.svg'
    );
  });

  it('works with Atomic assets (without .svg)', () => {
    expect(parseAssetURL('assets://attachment')).toBe('/assets/attachment.svg');
  });

  it('works with Atomic assets (with .svg)', () => {
    expect(parseAssetURL('assets://attachment.svg')).toBe(
      '/assets/attachment.svg'
    );
  });
});

describe('aggregate', () => {
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
