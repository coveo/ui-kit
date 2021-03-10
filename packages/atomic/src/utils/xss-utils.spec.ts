import {filterProtocol} from './xss-utils';

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
