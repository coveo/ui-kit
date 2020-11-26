import {buildSearchParameterSerializer} from './search-parameter-serializer';

describe('buildSearchParameterSerializer', () => {
  describe('#serialize', () => {
    const {serialize} = buildSearchParameterSerializer();

    it('encodes a record with a single key and string value', () => {
      const result = serialize({q: 'a'});
      expect(result).toBe('q=a');
    });

    it('encodes a record with a multiple keys and string values', () => {
      const result = serialize({q: 'a', enableQuerySyntax: true});
      expect(result).toBe('q=a&enableQuerySyntax=true');
    });
  });

  describe('#deserialize', () => {
    const {deserialize} = buildSearchParameterSerializer();

    it('passing an empty string returns an empty object', () => {
      const result = deserialize('');
      expect(result).toEqual({});
      expect('' in result).toBe(false);
    });

    it('decodes a string with a single key and primitive value', () => {
      const result = deserialize('q=a');
      expect(result).toEqual({q: 'a'});
    });

    it('decodes a string with a multiple keys and string values', () => {
      const result = deserialize('q=a&aq=b');
      expect(result).toEqual({q: 'a', aq: 'b'});
    });
  });
});
