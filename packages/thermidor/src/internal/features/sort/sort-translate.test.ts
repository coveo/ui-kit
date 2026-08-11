import {describe, it, expect} from 'vitest';
import {
  toSearchApiSort,
  toSearchApiCompoundSort,
  toCommerceApiSort,
  fromCommerceApiSort,
  toSetSortContext,
} from './sort-translate.js';
import type {SearchSortCriterion, CommerceSortCriterion} from './sort-types.js';

describe('toSearchApiSort', () => {
  it('converts relevance', () => {
    expect(toSearchApiSort({by: 'relevance'})).toBe('relevancy');
  });

  it('converts date ascending', () => {
    expect(toSearchApiSort({by: 'date', direction: 'ascending'})).toBe('date ascending');
  });

  it('converts date descending', () => {
    expect(toSearchApiSort({by: 'date', direction: 'descending'})).toBe('date descending');
  });

  it('converts field ascending', () => {
    expect(toSearchApiSort({by: 'field', field: 'price', direction: 'ascending'})).toBe(
      '@price ascending'
    );
  });

  it('converts field descending', () => {
    expect(
      toSearchApiSort({
        by: 'field',
        field: 'ec_rating',
        direction: 'descending',
      })
    ).toBe('@ec_rating descending');
  });

  it('converts qre', () => {
    expect(toSearchApiSort({by: 'qre'})).toBe('qre');
  });

  it('converts nosort', () => {
    expect(toSearchApiSort({by: 'nosort'})).toBe('nosort');
  });
});

describe('toSearchApiCompoundSort', () => {
  it('joins multiple criteria with commas', () => {
    const criteria: SearchSortCriterion[] = [
      {by: 'field', field: 'price', direction: 'ascending'},
      {by: 'date', direction: 'descending'},
    ];
    expect(toSearchApiCompoundSort(criteria)).toBe('@price ascending,date descending');
  });

  it('handles single criterion', () => {
    expect(toSearchApiCompoundSort([{by: 'relevance'}])).toBe('relevancy');
  });
});

describe('toCommerceApiSort', () => {
  it('converts relevance', () => {
    expect(toCommerceApiSort({by: 'relevance'})).toEqual({
      sortCriteria: 'relevance',
    });
  });

  it('converts field sort ascending', () => {
    expect(toCommerceApiSort({by: 'field', field: 'price', direction: 'ascending'})).toEqual({
      sortCriteria: 'fields',
      fields: [{field: 'price', direction: 'asc'}],
    });
  });

  it('converts field sort descending', () => {
    expect(toCommerceApiSort({by: 'field', field: 'price', direction: 'descending'})).toEqual({
      sortCriteria: 'fields',
      fields: [{field: 'price', direction: 'desc'}],
    });
  });

  it('includes displayName when provided', () => {
    expect(
      toCommerceApiSort({
        by: 'field',
        field: 'price',
        direction: 'descending',
        displayName: 'Price',
      })
    ).toEqual({
      sortCriteria: 'fields',
      fields: [{field: 'price', direction: 'desc', displayName: 'Price'}],
    });
  });

  it('omits displayName when not provided', () => {
    const result = toCommerceApiSort({by: 'field', field: 'price', direction: 'ascending'});
    expect(result).toEqual({
      sortCriteria: 'fields',
      fields: [{field: 'price', direction: 'asc'}],
    });
    expect(result.fields![0]).not.toHaveProperty('displayName');
  });
});

describe('fromCommerceApiSort', () => {
  it('converts relevance payload', () => {
    expect(fromCommerceApiSort({sortCriteria: 'relevance'})).toEqual({
      by: 'relevance',
    });
  });

  it('converts fields payload with displayName', () => {
    const result = fromCommerceApiSort({
      sortCriteria: 'fields',
      fields: [{field: 'price', direction: 'desc', displayName: 'Price (high-low)'}],
    });
    expect(result).toEqual({
      by: 'field',
      field: 'price',
      direction: 'descending',
      displayName: 'Price (high-low)',
    });
  });

  it('converts fields payload ascending', () => {
    const result = fromCommerceApiSort({
      sortCriteria: 'fields',
      fields: [{field: 'name', direction: 'asc'}],
    });
    expect(result).toEqual({
      by: 'field',
      field: 'name',
      direction: 'ascending',
      displayName: undefined,
    });
  });

  it('returns relevance fallback for unknown format', () => {
    expect(fromCommerceApiSort({sortCriteria: 'relevance'} as any)).toEqual({
      by: 'relevance',
    });
  });

  it('returns relevance fallback for fields with empty array', () => {
    expect(fromCommerceApiSort({sortCriteria: 'fields', fields: []})).toEqual({
      by: 'relevance',
    });
  });
});

describe('round-trip', () => {
  it('preserves relevance through toCommerceApiSort → fromCommerceApiSort', () => {
    const original: CommerceSortCriterion = {by: 'relevance'};
    expect(fromCommerceApiSort(toCommerceApiSort(original))).toEqual(original);
  });

  it('preserves field sort semantics through round-trip', () => {
    const original: CommerceSortCriterion = {
      by: 'field',
      field: 'price',
      direction: 'ascending',
    };
    const roundTripped = fromCommerceApiSort(toCommerceApiSort(original));
    expect(roundTripped.by).toBe('field');
    if (roundTripped.by === 'field') {
      expect(roundTripped.field).toBe('price');
      expect(roundTripped.direction).toBe('ascending');
    }
  });

  it('preserves field sort with displayName through round-trip', () => {
    const original: CommerceSortCriterion = {
      by: 'field',
      field: 'ec_price',
      direction: 'descending',
      displayName: 'Price',
    };
    const roundTripped = fromCommerceApiSort(toCommerceApiSort(original));
    expect(roundTripped.by).toBe('field');
    if (roundTripped.by === 'field') {
      expect(roundTripped.field).toBe('ec_price');
      expect(roundTripped.direction).toBe('descending');
      expect(roundTripped.displayName).toBe('Price');
    }
  });
});

describe('toSetSortContext', () => {
  it('converts relevance criterion', () => {
    expect(toSetSortContext({by: 'relevance'})).toEqual({sortCriteria: 'relevance'});
  });

  it('converts single field criterion', () => {
    expect(toSetSortContext({by: 'field', field: 'price', direction: 'ascending'})).toEqual({
      sortCriteria: 'fields',
      fields: [{field: 'price', direction: 'asc'}],
    });
  });

  it('converts field criterion descending', () => {
    expect(toSetSortContext({by: 'field', field: 'price', direction: 'descending'})).toEqual({
      sortCriteria: 'fields',
      fields: [{field: 'price', direction: 'desc'}],
    });
  });

  it('converts array with multiple field criteria', () => {
    expect(
      toSetSortContext([
        {by: 'field', field: 'price', direction: 'ascending'},
        {by: 'field', field: 'name', direction: 'descending'},
      ])
    ).toEqual({
      sortCriteria: 'fields',
      fields: [
        {field: 'price', direction: 'asc'},
        {field: 'name', direction: 'desc'},
      ],
    });
  });

  it('converts array with mixed criteria - picks field sorts', () => {
    expect(
      toSetSortContext([
        {by: 'field', field: 'price', direction: 'ascending'},
        {by: 'date', direction: 'descending'},
      ])
    ).toEqual({
      sortCriteria: 'fields',
      fields: [{field: 'price', direction: 'asc'}],
    });
  });

  it('converts date criterion', () => {
    expect(toSetSortContext({by: 'date', direction: 'ascending'})).toEqual({
      sortCriteria: 'date',
    });
  });

  it('converts qre criterion', () => {
    expect(toSetSortContext({by: 'qre'})).toEqual({sortCriteria: 'qre'});
  });
});
