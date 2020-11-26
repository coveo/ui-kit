import {
  serializeSearchParameters,
  deserializeSearchParameters,
} from './search-parameter-serializer';

describe('search parameter serializer', () => {
  it('encodes a record with a single key and string value', () => {
    const result = serializeSearchParameters({q: 'a'});
    expect(result).toBe('q=a');
  });

  // it('encodes a record with a multiple keys and string values', () => {
  //   const result = serializeSearchParameters({q: 'a', aq: 'b'});
  //   expect(result).toBe('q=a&aq=b');
  // });
});

describe('search parameter deserializer', () => {
  it('passing an empty string returns an empty object', () => {
    const result = deserializeSearchParameters('');
    expect(result).toEqual({});
    expect('' in result).toBe(false);
  });

  it('decodes a string with a single key and primitive value', () => {
    const result = deserializeSearchParameters('q=a');
    expect(result).toEqual({q: 'a'});
  });

  it('decodes a string with a multiple keys and string values', () => {
    const result = deserializeSearchParameters('q=a&aq=b');
    expect(result).toEqual({q: 'a', aq: 'b'});
  });
});
