import {searchSerializer} from './search-parameter-serializer';

const someSpecialCharactersThatNeedsEncoding = [
  '&',
  ',',
  '=',
  '[',
  ']',
  '#',
  '?',
  ' ',
  '/',
  '>',
];

describe('searchSerializer', () => {
  const {serialize, deserialize} = searchSerializer;
  describe('#serialize', () => {
    it('serializes a record with a single key and string value', () => {
      const result = serialize({q: 'a'});
      expect(result).toBe('q=a');
    });

    it('serializes special characters in records', () => {
      someSpecialCharactersThatNeedsEncoding.forEach((specialChar) => {
        const result = serialize({q: `hello${specialChar}`});
        expect(result).toBe(`q=hello${encodeURIComponent(specialChar)}`);
      });
    });

    it('does not include invalid keys', () => {
      const invalidKeys = {invalid: 'b'};
      const result = serialize({q: 'a', ...invalidKeys});

      expect(result).toBe('q=a');
    });
  });

  describe('#deserialize', () => {
    it('passing an empty string returns an empty object', () => {
      const result = deserialize('');
      expect(result).toEqual({});
      expect('' in result).toBe(false);
    });

    it('deserializes a string with a single key and string value', () => {
      const result = deserialize('q=a');
      expect(result).toEqual({q: 'a'});
    });

    it('deserializes a string with a single key and string value with special characters', () => {
      someSpecialCharactersThatNeedsEncoding.forEach((char) => {
        const result = deserialize(`q=${encodeURIComponent(char)}`);
        expect(result).toEqual({q: char});
      });
    });

    it('removes keys that are invalid', () => {
      const result = deserialize('invalid=b');
      expect(result).toEqual({});
    });

    it('deserializes a string with special characters', () => {
      someSpecialCharactersThatNeedsEncoding.forEach((char) => {
        const result = deserialize(
          `q=${encodeURIComponent(char)}&enableQuerySyntax=true`
        );
        expect(result).toEqual({q: char});
      });
    });

    it('deserializes a string where the value contains an equals sign (e.g., q)', () => {
      const result = deserialize('q=@author==alice');
      expect(result).toEqual({q: '@author==alice'});
    });
  });

  it('can serialize and deserialize all search parameters', () => {
    const parameters = {
      q: 'some query',
    };

    const serialized = serialize(parameters);
    const deserialized = deserialize(serialized);

    expect(deserialized).toEqual(parameters);
  });
});
