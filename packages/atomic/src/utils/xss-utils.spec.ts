import {describe, expect, it} from 'vitest';
import {filterProtocol} from './xss-utils';

describe('filterProtocol', () => {
  it('when passing a problematic protocol such as javascript, it returns and empty string', () => {
    expect(filterProtocol('javascript:alert(1)')).toBe('');
  });

  it('allows good protocols', () => {
    expect(filterProtocol('https://github.com/')).toBe('https://github.com/');
    expect(filterProtocol('ftp://example.com/file.txt')).toBe(
      'ftp://example.com/file.txt'
    );
    expect(filterProtocol('file:///path/to/file')).toBe('file:///path/to/file');
    expect(filterProtocol('mailto:user@example.com')).toBe(
      'mailto:user@example.com'
    );
    expect(filterProtocol('tel:+1234567890')).toBe('tel:+1234567890');
    expect(filterProtocol('sip:user@domain.com')).toBe('sip:user@domain.com');
    expect(filterProtocol('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')).toBe(
      'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
    );
  });

  it('allows local paths', () => {
    expect(filterProtocol('/index.html')).toBe('/index.html');
  });
});
