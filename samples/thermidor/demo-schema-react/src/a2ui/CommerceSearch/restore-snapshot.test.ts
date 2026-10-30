import {describe, it, expect} from 'vitest';
import {buildRestoreSnapshot, type SurfaceNode} from './restore-snapshot.js';

const PAGINATION = {page: 2, pageSize: 12, totalEntries: 43, totalPages: 4};

function snapshot(states: Record<string, unknown>, nodes: SurfaceNode[]) {
  return buildRestoreSnapshot(nodes, (id) => states[id]);
}

describe('buildRestoreSnapshot', () => {
  it('restores the query, page, page size and sort', () => {
    expect(
      snapshot(
        {
          summary: {query: 'surf', firstIndex: 25, lastIndex: 36, totalEntries: 43},
          pagination: PAGINATION,
          sort: {
            appliedSort: {sortCriteria: 'price_asc', fields: []},
            availableSorts: [],
          },
        },
        [
          {id: 'root', type: 'CommerceSearch'},
          {id: 'summary', type: 'QuerySummary'},
          {id: 'pagination', type: 'Pagination'},
          {id: 'sort', type: 'Sort'},
        ]
      )
    ).toEqual({query: 'surf', page: 2, pageSize: 12, sortCriteria: 'price_asc'});
  });

  it('restores the selected values of a regular facet', () => {
    const result = snapshot(
      {
        pagination: PAGINATION,
        brand: {
          field: 'ec_brand',
          values: [
            {value: 'Billabong', state: 'selected', numberOfResults: 4},
            {value: 'Hurley', state: 'idle', numberOfResults: 3},
            {value: 'Xcel', state: 'excluded', numberOfResults: 2},
          ],
        },
      },
      [
        {id: 'pagination', type: 'Pagination'},
        {id: 'brand', type: 'RegularFacet'},
      ]
    );
    expect(result?.facets).toEqual([{facetId: 'ec_brand', values: ['Billabong']}]);
  });

  it('restores the selected and custom ranges of a numeric facet', () => {
    const result = snapshot(
      {
        pagination: PAGINATION,
        price: {
          field: 'ec_price',
          values: [
            {start: 0, end: 100, state: 'selected', numberOfResults: 10},
            {start: 100, end: 200, state: 'idle', numberOfResults: 5},
          ],
          customRange: {start: 250, end: 400, numberOfResults: 2},
        },
      },
      [
        {id: 'pagination', type: 'Pagination'},
        {id: 'price', type: 'NumericFacet'},
      ]
    );
    expect(result?.facets).toEqual([
      {
        facetId: 'ec_price',
        numericRanges: [
          {start: 0, end: 100},
          {start: 250, end: 400},
        ],
      },
    ]);
  });

  it('restores the selected path of a category facet', () => {
    const result = snapshot(
      {
        pagination: PAGINATION,
        category: {
          field: 'ec_category',
          values: {
            ancestry: [],
            children: [],
            selected: {value: 'Surfboards', path: ['Surfing', 'Surfboards'], numberOfResults: 6},
          },
        },
      },
      [
        {id: 'pagination', type: 'Pagination'},
        {id: 'category', type: 'CategoryFacet'},
      ]
    );
    expect(result?.facets).toEqual([{facetId: 'ec_category', path: ['Surfing', 'Surfboards']}]);
  });

  it('leaves out facets without an active value', () => {
    const result = snapshot(
      {
        pagination: PAGINATION,
        brand: {field: 'ec_brand', values: [{value: 'Hurley', state: 'idle', numberOfResults: 3}]},
        price: {field: 'ec_price', values: [], customRange: null},
        category: {field: 'ec_category', values: {ancestry: [], children: [], selected: null}},
      },
      [
        {id: 'pagination', type: 'Pagination'},
        {id: 'brand', type: 'RegularFacet'},
        {id: 'price', type: 'NumericFacet'},
        {id: 'category', type: 'CategoryFacet'},
      ]
    );
    expect(result).toEqual({query: '', page: 2, pageSize: 12});
  });

  it('has nothing to restore before the surface has a page', () => {
    expect(snapshot({}, [{id: 'pagination', type: 'Pagination'}])).toBeUndefined();
  });
});
