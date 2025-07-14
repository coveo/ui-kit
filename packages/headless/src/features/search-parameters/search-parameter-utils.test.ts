import type {SearchParameterKey} from './search-parameter-serializer.js';
import {
  addFacetValuesToSearchParams,
  extendSearchParameters,
  isFacetPair,
  isRangeFacetPair,
  isValidSearchParam,
  type SearchParamValue,
  toArray,
} from './search-parameter-utils.js';

describe('search-parameter-utils', () => {
  describe('toArray', () => {
    it('should return an array when given a single value', () => {
      const value = 'test';
      expect(toArray(value)).toEqual([value]);
    });

    it('should return the same array when given an array', () => {
      const value = ['test1', 'test2'];
      expect(toArray(value)).toEqual(value);
    });

    it('should return an array with the value when given a non-array value', () => {
      const value = 123;
      expect(toArray(value)).toEqual([value]);
    });
  });

  describe('addFacetValuesToSearchParams', () => {
    it('should add facet values to search parameters', () => {
      const facetId = 'color';
      const paramKey = 'f';
      const searchParams: Record<string, unknown> = {};
      const valueArray = ['red', 'blue'];

      addFacetValuesToSearchParams(facetId, paramKey)(searchParams, valueArray);

      expect(searchParams).toEqual({
        f: {
          color: ['red', 'blue'],
        },
      });
    });

    it('should append facet values to existing search parameters', () => {
      const facetId = 'color';
      const paramKey = 'f';
      const searchParams: Record<string, unknown> = {
        q: 'test',
        f: {
          size: ['small'],
        },
      };
      const valueArray = ['red', 'blue'];

      addFacetValuesToSearchParams(facetId, paramKey)(searchParams, valueArray);

      expect(searchParams).toEqual({
        q: 'test',
        f: {
          size: ['small'],
          color: ['red', 'blue'],
        },
      });
    });
  });

  describe('isValidSearchParam', () => {
    it('should return true for a valid facet search parameter key', () => {
      const key = 'f-color';
      expect(isValidSearchParam(key)).toBe(true);
    });

    it('should return true for a invalid facet search parameter key', () => {
      const key = 'f.color';
      expect(isValidSearchParam(key)).toBe(false);
    });

    it('should return true for a valid basic search parameter key', () => {
      const key = 'q';
      expect(isValidSearchParam(key)).toBe(true);
    });

    it('should return false for an invalid search parameter key', () => {
      const key = 'invalidKey';
      expect(isValidSearchParam(key)).toBe(false);
    });
  });

  describe('isFacetPair', () => {
    it('should return true for a valid facet pair', () => {
      const pair: [SearchParameterKey, unknown] = [
        'f',
        {color: ['red', 'blue']},
      ];
      expect(isFacetPair(pair)).toBe(true);
    });

    it('should return false for an invalid facet pair with an invalid key', () => {
      const pair: [SearchParameterKey, unknown] = [
        'invalidKey' as unknown as SearchParameterKey,
        {color: ['red', 'blue']},
      ];
      expect(isFacetPair(pair)).toBe(false);
    });

    it('should return false for an invalid facet pair with an invalid value', () => {
      const pair: [SearchParameterKey, unknown] = ['f', 'invalid'];
      expect(isFacetPair(pair)).toBe(false);
    });
  });

  describe('isRangeFacetPair', () => {
    it('should return true for a valid range facet pair', () => {
      const pair: [SearchParameterKey, unknown] = [
        'nf',
        {field: [{end: 1, start: 100, endInclusive: true, state: 'excluded'}]},
      ];
      expect(isRangeFacetPair(pair)).toBe(true);
    });

    it('should return false for an invalid range facet pair with an invalid key', () => {
      const pair: [SearchParameterKey, unknown] = [
        'invalidKey' as unknown as SearchParameterKey,
        {field: [{end: 1, start: 100, endInclusive: true, state: 'excluded'}]},
      ];
      expect(isRangeFacetPair(pair)).toBe(false);
    });

    it('should return false for an invalid range facet pair with an invalid value', () => {
      const pair: [SearchParameterKey, unknown] = ['nf', 'invalid'];
      expect(isRangeFacetPair(pair)).toBe(false);
    });

    it('should return false for an invalid range facet pair with a different key', () => {
      const pair: [SearchParameterKey, unknown] = ['df', {start: 0, end: 100}];
      expect(isRangeFacetPair(pair)).toBe(false);
    });
  });

  describe('extendSearchParameters', () => {
    it.each([null, undefined])(
      'should not modify searchParams if value is %s',
      (value: unknown) => {
        const searchParams: Record<string, unknown> = {foo: 'bar'};
        const key = 'q';

        extendSearchParameters(searchParams, key, value as SearchParamValue);

        expect(searchParams).toEqual({foo: 'bar'});
      }
    );

    it('should add the value to searchParams if key is a valid basic key', () => {
      const searchParams: Record<string, unknown> = {foo: 'bar'};
      const key = 'q';
      const value = 'test';

      extendSearchParameters(searchParams, key, value);

      expect(searchParams).toEqual({q: 'test', foo: 'bar'});
    });

    it('should not modify searchParams if key is not a valid key', () => {
      const searchParams: Record<string, unknown> = {foo: 'bar'};
      const key = 'invalidKey';
      const value = 'test';

      extendSearchParameters(searchParams, key, value);

      expect(searchParams).toEqual({foo: 'bar'});
    });

    it('should add facet values to searchParams if key is a valid facet key', () => {
      const searchParams: Record<string, unknown> = {foo: 'bar'};
      const key = 'f-color';
      const value = ['red', 'blue'];

      extendSearchParameters(searchParams, key, value);

      expect(searchParams).toEqual({
        foo: 'bar',
        f: {
          color: ['red', 'blue'],
        },
      });
    });

    it('should add numeric ranges to searchParams if key is "nf"', () => {
      const searchParams: Record<string, unknown> = {};
      const key = 'nf-color';
      const value = '1..100';

      extendSearchParameters(searchParams, key, value);

      expect(searchParams).toEqual({
        nf: {
          color: [{start: 1, end: 100, endInclusive: false, state: 'selected'}],
        },
      });
    });

    it('should add date ranges to searchParams if key is "df"', () => {
      const date1 = '2010/01/01@05:00:00';
      const date2 = '2011/01/01@05:00:00';
      const searchParams: Record<string, unknown> = {};
      const key = 'df-date';
      const value = `${date1}..${date2}`;

      extendSearchParameters(searchParams, key, value);

      expect(searchParams).toEqual({
        df: {
          date: [
            {
              end: '2011/01/01@05:00:00',
              endInclusive: false,
              start: '2010/01/01@05:00:00',
              state: 'selected',
            },
          ],
        },
      });
    });
  });
});
