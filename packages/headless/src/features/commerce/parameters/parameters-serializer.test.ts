import {buildDateRange} from '../../../controllers/core/facets/range-facet/date-facet/date-range.js';
import {buildNumericRange} from '../../../controllers/core/facets/range-facet/numeric-facet/numeric-range.js';
import {CommerceSearchParameters} from '../search-parameters/search-parameters-actions.js';
import {buildFieldsSortCriterion, SortDirection} from '../sort/sort.js';
import {searchSerializer} from './parameters-serializer.js';

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
        const result = deserialize(`q=${encodeURIComponent(char)}`);
        expect(result).toEqual({q: char});
      });
    });

    it('deserializes a string where the value contains an equals sign (e.g., q)', () => {
      const result = deserialize('q=@author==alice');
      expect(result).toEqual({q: '@author==alice'});
    });
  });

  it('can serialize and deserialize all search parameters', () => {
    const f = {author: ['a', 'b']};
    const cf = {geography: ['a', 'b']};
    const nf = {
      size: [buildNumericRange({start: 0, end: 10, state: 'selected'})],
    };
    const df = {
      created: [
        buildDateRange({
          start: '2010/01/01@05:00:00',
          end: '2011/01/01@05:00:00',
          state: 'selected',
        }),
      ],
    };
    const mnf = {
      price: [buildNumericRange({start: 0, end: 10, state: 'selected'})],
    };
    const page = 4;
    const perPage = 96;
    const sortCriteria = buildFieldsSortCriterion([
      {name: 'author', direction: SortDirection.Ascending},
      {name: 'created', direction: SortDirection.Descending},
    ]);
    const parameters: Required<CommerceSearchParameters> = {
      q: 'some query',
      f,
      cf,
      nf,
      mnf,
      df,
      page,
      perPage,
      sortCriteria,
    };

    const serialized = serialize(parameters);
    const deserialized = deserialize(serialized);

    expect(deserialized).toEqual(parameters);
  });
});
