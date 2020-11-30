import {buildMockSearchParameters} from '../../test/mock-search-parameters';
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

    it('deserializes a string with a single key and string value', () => {
      const result = deserialize('q=a');
      expect(result).toEqual({q: 'a'});
    });

    it('removes keys that are invalid', () => {
      const result = deserialize('invalid=b');
      expect(result).toEqual({});
    });

    it('deserializes a string with a key and a boolean value', () => {
      const result = deserialize('enableQuerySyntax=true');
      expect(result).toEqual({enableQuerySyntax: true});
    });

    it('deserializes a string with multiple key-value pairs', () => {
      const result = deserialize('q=a&enableQuerySyntax=true');
      expect(result).toEqual({q: 'a', enableQuerySyntax: true});
    });
  });

  it('can serialize and deserialize all search parameters', () => {
    const {serialize, deserialize} = buildSearchParameterSerializer();
    const parameters = buildMockSearchParameters();
    const serialized = serialize(parameters);
    const deserialized = deserialize(serialized);

    expect(deserialized).toEqual(parameters);
  });
});
