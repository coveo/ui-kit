import {buildMockSearchParameters} from '../../test/mock-search-parameters';
import {buildSearchParameterSerializer} from './search-parameter-serializer';

describe('buildSearchParameterSerializer', () => {
  describe('#serialize', () => {
    const {serialize} = buildSearchParameterSerializer();

    it('serializes a record with a single key and string value', () => {
      const result = serialize({q: 'a'});
      expect(result).toBe('q=a');
    });

    it('serializes a record with a multiple keys and string values', () => {
      const result = serialize({q: 'a', enableQuerySyntax: true});
      expect(result).toBe('q=a&enableQuerySyntax=true');
    });

    it('does not include invalid keys', () => {
      const invalidKeys = {invalid: 'b'};
      const result = serialize({q: 'a', ...invalidKeys});

      expect(result).toBe('q=a');
    });

    it('serializes the #f parameter correctly', () => {
      const f = {author: ['a', 'b'], filetype: ['c', 'd']};
      const result = serialize({f});
      expect(result).toEqual('f[author]=a,b&f[filetype]=c,d');
    });

    it('when the #f parameter contains invalid values, it does not include it', () => {
      const f = {author: [1]} as never;
      const result = serialize({f});
      expect(result).toEqual('');
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

    it('deserializes a string where the value contains an equals sign (e.g. aq)', () => {
      const result = deserialize('aq=@author==alice');
      expect(result).toEqual({aq: '@author==alice'});
    });

    it('deserializes two facets correctly', () => {
      const result = deserialize('f[author]=a,b&f[filetype]=c,d');
      expect(result).toEqual({
        f: {
          author: ['a', 'b'],
          filetype: ['c', 'd'],
        },
      });
    });
  });

  it('can serialize and deserialize all search parameters', () => {
    const f = {author: ['a', 'b']};
    const parameters = buildMockSearchParameters({f});

    const {serialize, deserialize} = buildSearchParameterSerializer();
    const serialized = serialize(parameters);
    const deserialized = deserialize(serialized);

    expect(deserialized).toEqual(parameters);
  });
});
