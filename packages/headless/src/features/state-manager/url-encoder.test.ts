import {encodeToUrlFragment, decodeUrlFragment} from './url-encoder';

describe('url encoder', () => {
  it('encodes a record with a single key and string value', () => {
    const result = encodeToUrlFragment({q: 'a'});
    expect(result).toBe('q=a');
  });

  // it('encodes a record with a multiple keys and string values', () => {
  //   const result = encodeToUrlFragment({q: 'a', aq: 'b'});
  //   expect(result).toBe('q=a&aq=b');
  // });
});

describe('url decoder', () => {
  it('passing an empty string returns an empty object', () => {
    const result = decodeUrlFragment('');
    expect(result).toEqual({});
    expect('' in result).toBe(false);
  });

  it('decodes a string with a single key and primitive value', () => {
    const result = decodeUrlFragment('q=a');
    expect(result).toEqual({q: 'a'});
  });

  it('decodes a string with a multiple keys and string values', () => {
    const result = decodeUrlFragment('q=a&aq=b');
    expect(result).toEqual({q: 'a', aq: 'b'});
  });
});
