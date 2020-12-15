import {buildDateRange} from '../../controllers/facets/range-facet/date-facet/headless-date-facet';
import {buildNumericRange} from '../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet';
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

    it('serializes the #nf parameter correctly', () => {
      const nf = {
        size: [
          buildNumericRange({start: 0, end: 10}),
          buildNumericRange({start: 10, end: 20}),
        ],
        amount: [buildNumericRange({start: 100, end: 200})],
      };

      const result = serialize({nf});
      expect(result).toEqual('nf[size]=0..10,10..20&nf[amount]=100..200');
    });

    describe('when the #nf parameter contains facetIds with invalid values', () => {
      it('if a range does not have a #start key, it does not include it', () => {
        const nf = {size: [{}]} as never;
        const result = serialize({nf});
        expect(result).toEqual('');
      });

      it('if a range does not have an #end key, it does not include it', () => {
        const nf = {size: [{start: 10}]} as never;
        const result = serialize({nf});
        expect(result).toEqual('');
      });
    });

    it('serializes the #df parameter correctly', () => {
      const date1 = '2010/01/01@05:00:00';
      const date2 = '2011/01/01@05:00:00';
      const date3 = '2012/01/01@05:00:00';

      const df = {
        date: [
          buildDateRange({start: date1, end: date2, useLocalTime: true}),
          buildDateRange({start: date2, end: date3, useLocalTime: true}),
        ],
        created: [
          buildDateRange({start: date1, end: date2, useLocalTime: true}),
        ],
      };

      const result = serialize({df});
      const range1 = `${date1}..${date2}`;
      const range2 = `${date2}..${date3}`;

      expect(result).toEqual(
        `df[date]=${range1},${range2}&df[created]=${range1}`
      );
    });

    describe('when the #df parameter contains facetIds with invalid values', () => {
      it('if a range does not have a #start key, it does not include it', () => {
        const df = {created: [{}]} as never;
        const result = serialize({df});
        expect(result).toEqual('');
      });

      it('if a range does not have an #end key, it does not include it', () => {
        const df = {size: [{start: '2010/01/01@05:00:00'}]} as never;
        const result = serialize({df});
        expect(result).toEqual('');
      });
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

    it('deserializes two category facets correctly', () => {
      const result = deserialize('cf[author]=a,b&cf[filetype]=c,d');
      expect(result).toEqual({
        cf: {
          author: ['a', 'b'],
          filetype: ['c', 'd'],
        },
      });
    });

    it('deserializes a numeric facet with multiple selections', () => {
      const result = deserialize('nf[size]=0..10,10..20');
      expect(result).toEqual({
        nf: {
          size: [
            buildNumericRange({start: 0, end: 10}),
            buildNumericRange({start: 10, end: 20}),
          ],
        },
      });
    });

    it('deserializes multiple numeric facets with selected values', () => {
      const result = deserialize('nf[size]=0..10&nf[amount]=100..200');
      expect(result).toEqual({
        nf: {
          size: [buildNumericRange({start: 0, end: 10})],
          amount: [buildNumericRange({start: 100, end: 200})],
        },
      });
    });

    it('deserializes a numeric facet with a float range', () => {
      const result = deserialize('nf[size]=7.5..8.5,8.5..9.5');
      expect(result).toEqual({
        nf: {
          size: [
            buildNumericRange({start: 7.5, end: 8.5}),
            buildNumericRange({start: 8.5, end: 9.5}),
          ],
        },
      });
    });

    it(`when a numeric facet range contains a non-numeric value,
    the deserializer sets the values for the facetId to an empty array`, () => {
      const result = deserialize('nf[size]=0..a');
      expect(result).toEqual({
        nf: {size: []},
      });
    });

    it(`when a numeric facet range contains one number,
    the deserializer sets the values for the facetId to an empty array`, () => {
      const result = deserialize('nf[size]=0');
      expect(result).toEqual({
        nf: {size: []},
      });
    });

    it('deserializes a date facet with multiple selections', () => {
      const date1 = '2010/01/01@05:00:00';
      const date2 = '2011/01/01@05:00:00';
      const date3 = '2012/01/01@05:00:00';

      const rangeA = `${date1}..${date2}`;
      const rangeB = `${date2}..${date3}`;

      const result = deserialize(`df[date]=${rangeA},${rangeB}`);

      expect(result).toEqual({
        df: {
          date: [
            buildDateRange({start: date1, end: date2, useLocalTime: true}),
            buildDateRange({start: date2, end: date3, useLocalTime: true}),
          ],
        },
      });
    });

    it('deserializes multiple date facets with selected values', () => {
      const date1 = '2010/01/01@05:00:00';
      const date2 = '2011/01/01@05:00:00';
      const range = `${date1}..${date2}`;

      const result = deserialize(`df[date]=${range}&df[created]=${range}`);
      const expected = buildDateRange({
        start: date1,
        end: date2,
        useLocalTime: true,
      });

      expect(result).toEqual({
        df: {
          date: [expected],
          created: [expected],
        },
      });
    });

    it(`when a date facet range contains a invalid format,
    the deserializer sets the values for the facetId to an empty array`, () => {
      const result = deserialize('df[date]=2010/01/01@05:00:00..a');
      expect(result).toEqual({
        df: {date: []},
      });
    });

    it(`when a numeric facet range contains one number,
    the deserializer sets the values for the facetId to an empty array`, () => {
      const result = deserialize('df[date]=2010/01/01@05:00:00');
      expect(result).toEqual({
        df: {date: []},
      });
    });
  });

  it('can serialize and deserialize all search parameters', () => {
    const f = {author: ['a', 'b']};
    const cf = {geography: ['a', 'b']};
    const nf = {size: [buildNumericRange({start: 0, end: 10})]};
    const df = {
      created: [
        buildDateRange({
          start: '2010/01/01@05:00:00',
          end: '2011/01/01@05:00:00',
        }),
      ],
    };
    const parameters = buildMockSearchParameters({f, cf, nf, df});

    const {serialize, deserialize} = buildSearchParameterSerializer();
    const serialized = serialize(parameters);
    const deserialized = deserialize(serialized);

    expect(deserialized).toEqual(parameters);
  });
});
