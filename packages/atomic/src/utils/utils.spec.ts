import {once, camelToKebab, randomID, filterProtocol} from './utils';

describe('once', () => {
  it('should call the function only once', () => {
    const myFunction = jest.fn();
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

describe('randomID', () => {
  it('when a string to prepend is passed, it places it at the start of the id', () => {
    expect(randomID('prefix')).toMatch(/^prefix/);
  });

  it('when called twice, it returns two different ids', () => {
    expect(randomID()).not.toBe(randomID());
  });
});

describe('filterProtocol', () => {
  it('when passing a problematic protocal such as javascript, it returns and empty string', () => {
    expect(filterProtocol('javascript:alert(1)')).toBe('');
  });

  it('allows good protocols', () => {
    expect(filterProtocol('https://github.com/')).toBe('https://github.com/');
  });

  it('allows local paths', () => {
    expect(filterProtocol('/index.html')).toBe('/index.html');
  });
});
