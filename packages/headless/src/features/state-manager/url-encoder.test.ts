import {encodeToUrlFragment, decodeUrlFragment} from './url-encoder';

describe('url encoder', () => {
  it('encodes a record with a single key and primitive value', () => {
    const result = encodeToUrlFragment({a: true});
    expect(result).toBe('a=true');
  });

  it('encodes a record with a single key and an object value', () => {
    const result = encodeToUrlFragment({a: {b: true}});
    expect(result).toBe('a={"b":true}');
  });
});

describe('url decoder', () => {
  it('decodes a string with a single key and primitive value', () => {
    const result = decodeUrlFragment('a=true');
    expect(result).toEqual({a: true});
  });

  it('decodes a string with a single key and an object value', () => {
    const result = decodeUrlFragment('a={"b":true}');
    expect(result).toEqual({a: {b: true}});
  });
});
