import {describe, expect, it} from 'vitest';
import {buildDateRange} from '../../../controllers/core/facets/range-facet/date-facet/date-range.js';
import {buildNumericRange} from '../../../controllers/core/facets/range-facet/numeric-facet/numeric-range.js';
import type {CommerceSearchParameters} from '../search-parameters/search-parameters-actions.js';
import {buildFieldsSortCriterion, SortDirection} from '../sort/sort.js';
import {
  productListingSerializer,
  searchSerializer,
} from './parameters-serializer.js';

describe('searchSerializer', () => {
  const {serialize, deserialize} = searchSerializer;

  describe('#serialize ', () => {
    it('should serialize the q record', () => {
      const result = serialize({q: 'a'});

      expect(result).toBe('q=a');
    });
  });

  describe('#deserialize', () => {
    it('should deserialize the q parameter', () => {
      const result = deserialize('q=a');

      expect(result).toEqual({q: 'a'});
    });
  });

  it('should serialize and deserialize all search parameters', () => {
    const parameters: Omit<
      CommerceSearchParameters,
      'dfExcluded' | 'mnfExcluded' | 'nfExcluded'
    > = getParameters();

    const serialized = serialize(parameters);
    const deserialized = deserialize(serialized);

    expect(deserialized).toStrictEqual(parameters);
  });
});

describe('productListingSerializer', () => {
  const {serialize, deserialize} = productListingSerializer;

  it('should serialize and deserialize all product listing parameters', () => {
    const parameters: Omit<
      CommerceSearchParameters,
      'dfExcluded' | 'mnfExcluded' | 'nfExcluded' | 'q'
    > = getParameters(false);

    const serialized = serialize(parameters);
    const deserialized = deserialize(serialized);

    expect(deserialized).toStrictEqual(parameters);
  });
});

describe.each([
  {serializer: searchSerializer, name: 'searchSerializer'},
  {serializer: productListingSerializer, name: 'productListingSerializer'},
])('$name', ({serializer}) => {
  const {serialize, deserialize} = serializer;

  describe('#serialize', () => {
    it('should serialize cf-* records', () => {
      const result = serialize({cf: {one: ['a'], two: ['b', 'c']}});

      expect(result).toBe('cf-one=a&cf-two=b,c');
    });

    it('should serialize df-* records', () => {
      const result = serialize({
        df: {
          one: [
            buildDateRange({
              start: '2010/01/01@05:00:00',
              end: '2011/01/01@05:00:00',
              state: 'selected',
            }),
          ],
          two: [
            buildDateRange({
              start: '2012/01/01@05:00:00',
              end: '2013/01/01@05:00:00',
              state: 'selected',
            }),
            buildDateRange({
              start: '2014/01/01@05:00:00',
              end: '2015/01/01@05:00:00',
              state: 'selected',
            }),
          ],
        },
      });

      expect(result).toBe(
        'df-one=2010/01/01@05:00:00..2011/01/01@05:00:00&df-two=2012/01/01@05:00:00..2013/01/01@05:00:00,2014/01/01@05:00:00..2015/01/01@05:00:00'
      );
    });

    it('should serialize f-* records', () => {
      const result = serialize({f: {one: ['a'], two: ['b', 'c']}});

      expect(result).toBe('f-one=a&f-two=b,c');
    });

    it('should serialize fExcluded-* records', () => {
      const result = serialize({fExcluded: {one: ['a'], two: ['b', 'c']}});

      expect(result).toBe('fExcluded-one=a&fExcluded-two=b,c');
    });

    it('should serialize lf-* records', () => {
      const result = serialize({lf: {one: ['a'], two: ['b', 'c']}});

      expect(result).toBe('lf-one=a&lf-two=b,c');
    });

    it('should serialize mnf-* records', () => {
      const result = serialize({
        mnf: {
          one: [buildNumericRange({start: 0, end: 10, state: 'selected'})],
          two: [
            buildNumericRange({start: 11, end: 20, state: 'selected'}),
            buildNumericRange({start: 21, end: 30, state: 'selected'}),
          ],
        },
      });

      expect(result).toBe('mnf-one=0..10&mnf-two=11..20,21..30');
    });

    it('should serialize nf-* records', () => {
      const result = serialize({
        nf: {
          one: [buildNumericRange({start: 0, end: 10, state: 'selected'})],
          two: [
            buildNumericRange({start: 11, end: 20, state: 'selected'}),
            buildNumericRange({start: 21, end: 30, state: 'selected'}),
          ],
        },
      });

      expect(result).toBe('nf-one=0..10&nf-two=11..20,21..30');
    });

    it('should prioritize an mnf-x record over an equivalent nf-x record', () => {
      const result = serialize({
        mnf: {
          one: [buildNumericRange({start: 0, end: 10, state: 'selected'})],
        },
        nf: {
          one: [buildNumericRange({start: 0, end: 10, state: 'selected'})],
        },
      });

      expect(result).toBe('mnf-one=0..10');
    });

    it('should keep non-equivalent mnf-x and nf-x records', () => {
      const result = serialize({
        mnf: {
          one: [buildNumericRange({start: 0, end: 10, state: 'selected'})],
        },
        nf: {
          one: [buildNumericRange({start: 11, end: 20, state: 'selected'})],
        },
      });

      expect(result).toBe('mnf-one=0..10&nf-one=11..20');
    });

    it('should serialize the page record', () => {
      const result = serialize({page: 4});

      expect(result).toBe('page=4');
    });

    it('should serialize the perPage record', () => {
      const result = serialize({perPage: 96});

      expect(result).toBe('perPage=96');
    });

    it('should serialize the sortCriteria record', () => {
      const result = serialize({
        sortCriteria: buildFieldsSortCriterion([
          {name: 'author', direction: SortDirection.Ascending},
          {name: 'created', direction: SortDirection.Descending},
        ]),
      });

      // eslint-disable-next-line @cspell/spellchecker
      expect(result).toBe('sortCriteria=author%20asc%2Ccreated%20desc');
    });

    it('should serialize special characters', () => {
      someSpecialCharactersThatNeedsEncoding.forEach((specialChar) => {
        const result = serialize({f: {one: [`hello${specialChar}`]}});
        expect(result).toBe(`f-one=hello${encodeURIComponent(specialChar)}`);
      });
    });

    it('should not serialize invalid records', () => {
      const invalidRecords = {invalidOne: 'b', invalidTwo: 'c'};
      const result = serialize({f: {one: ['a']}, ...invalidRecords});

      expect(result).toBe('f-one=a');
    });
  });

  describe('#deserialize', () => {
    it('should deserialize cf-* parameters', () => {
      const result = deserialize('cf-one=a&cf-two=b,c');

      expect(result).toStrictEqual({cf: {one: ['a'], two: ['b', 'c']}});
    });

    it('should deserialize df-* parameters', () => {
      const result = deserialize(
        'df-one=2010/01/01@05:00:00..2011/01/01@05:00:00&df-two=2012/01/01@05:00:00..2013/01/01@05:00:00,2014/01/01@05:00:00..2015/01/01@05:00:00'
      );

      expect(result).toStrictEqual({
        df: {
          one: [
            buildDateRange({
              start: '2010/01/01@05:00:00',
              end: '2011/01/01@05:00:00',
              state: 'selected',
            }),
          ],
          two: [
            buildDateRange({
              start: '2012/01/01@05:00:00',
              end: '2013/01/01@05:00:00',
              state: 'selected',
            }),
            buildDateRange({
              start: '2014/01/01@05:00:00',
              end: '2015/01/01@05:00:00',
              state: 'selected',
            }),
          ],
        },
      });
    });

    it('should deserialize f-* parameters', () => {
      const result = deserialize('f-one=a&f-two=b,c');

      expect(result).toStrictEqual({f: {one: ['a'], two: ['b', 'c']}});
    });

    it('should deserialize fExcluded-* parameters', () => {
      const result = deserialize('fExcluded-one=a&fExcluded-two=b,c');

      expect(result).toStrictEqual({fExcluded: {one: ['a'], two: ['b', 'c']}});
    });

    it('should deserialize lf-* parameters', () => {
      const result = deserialize('lf-one=a&lf-two=b,c');

      expect(result).toStrictEqual({lf: {one: ['a'], two: ['b', 'c']}});
    });

    it('should deserialize mnf-* parameters', () => {
      const result = deserialize('mnf-one=0..10&mnf-two=11..20,21..30');

      expect(result).toStrictEqual({
        mnf: {
          one: [buildNumericRange({start: 0, end: 10, state: 'selected'})],
          two: [
            buildNumericRange({start: 11, end: 20, state: 'selected'}),
            buildNumericRange({start: 21, end: 30, state: 'selected'}),
          ],
        },
      });
    });

    it('should deserialize nf-* parameters', () => {
      const result = deserialize('nf-one=0..10&nf-two=11..20,21..30');

      expect(result).toStrictEqual({
        nf: {
          one: [buildNumericRange({start: 0, end: 10, state: 'selected'})],
          two: [
            buildNumericRange({start: 11, end: 20, state: 'selected'}),
            buildNumericRange({start: 21, end: 30, state: 'selected'}),
          ],
        },
      });
    });

    it('should deserialize the page parameter', () => {
      const result = deserialize('page=4');

      expect(result).toEqual({page: 4});
    });

    it('should deserialize the perPage parameter', () => {
      const result = deserialize('perPage=96');

      expect(result).toEqual({perPage: 96});
    });

    it('should deserialize the sortCriteria parameter', () => {
      // eslint-disable-next-line @cspell/spellchecker
      const result = deserialize('sortCriteria=author%20asc%2Ccreated%20desc');

      expect(result).toStrictEqual({
        sortCriteria: buildFieldsSortCriterion([
          {name: 'author', direction: SortDirection.Ascending},
          {name: 'created', direction: SortDirection.Descending},
        ]),
      });
    });

    it('should return an empty object when passed an empty string', () => {
      const result = deserialize('');
      expect(result).toEqual({});
      expect('' in result).toBe(false);
    });

    it('should deserialize special characters', () => {
      someSpecialCharactersThatNeedsEncoding.forEach((char) => {
        const result = deserialize(`f-one=${encodeURIComponent(char)}`);
        expect(result).toEqual({f: {one: [char]}});
      });
    });

    it('should ignore invalid parameters', () => {
      const result = deserialize('f-one=a&invalidOne=b&invalidTwo=c');
      expect(result).toEqual({f: {one: ['a']}});
    });
  });
});

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

const getParameters = (includeQ = true) => {
  const valueWithSpecialCharacters = `a${someSpecialCharactersThatNeedsEncoding.join('')}`;

  return {
    ...(includeQ && {q: valueWithSpecialCharacters}),
    f: {one: [valueWithSpecialCharacters, 'b'], two: ['c']},
    fExcluded: {
      one: ['c'],
      two: ['d', 'e'],
      three: [valueWithSpecialCharacters],
    },
    lf: {four: [valueWithSpecialCharacters, 'b'], five: ['c']},
    cf: {six: [valueWithSpecialCharacters, 'b'], seven: ['c']},
    nf: {
      eight: [
        buildNumericRange({start: 0, end: 10, state: 'selected'}),
        buildNumericRange({start: 11, end: 20, state: 'selected'}),
      ],
      nine: [buildNumericRange({start: 0, end: 10, state: 'selected'})],
    },
    mnf: {
      eight: [buildNumericRange({start: 21, end: 30, state: 'selected'})],
    },
    df: {
      ten: [
        buildDateRange({
          start: '2010/01/01@05:00:00',
          end: '2011/01/01@05:00:00',
          state: 'selected',
        }),
      ],
    },
    page: 4,
    perPage: 96,
    sortCriteria: buildFieldsSortCriterion([
      {name: 'one', direction: SortDirection.Ascending},
      {name: 'two', direction: SortDirection.Descending},
    ]),
  };
};
