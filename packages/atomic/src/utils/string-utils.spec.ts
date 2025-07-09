import {describe, expect, it} from 'vitest';
import {encodeForDomAttribute} from './string-utils';

describe('encodeForDomAttribute', () => {
  it('should return same string when passed letters and numbers only', () => {
    expect(encodeForDomAttribute('dress12')).toEqual('dress12');
  });
  it('should return empty string when passed an empty string', () => {
    expect(encodeForDomAttribute('')).toEqual('');
  });
  it('should encode string with special characters', () => {
    expect(encodeForDomAttribute('dress!@£')).toEqual('dress3364163');
    expect(encodeForDomAttribute('dress$%^&')).toEqual('dress36379438');
    expect(encodeForDomAttribute('dress*+=')).toEqual('dress424361');
    expect(encodeForDomAttribute('dress $.')).toEqual('dress323646');
  });
});
