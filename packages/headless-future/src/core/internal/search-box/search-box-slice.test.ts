/**
 * SearchBox Slice Tests
 */

import {describe, it, expect} from 'vitest';
import {searchBoxSlice, initialSearchBoxState} from './search-box-slice.js';
import * as SearchBoxActions from './search-box-actions.js';

describe('searchBoxSlice: initialState', () => {
  it('should have correct initial state', () => {
    expect(initialSearchBoxState).toEqual({
      query: '',
    });
  });
});

describe('searchBoxSlice: setQuery', () => {
  it('should update query string', () => {
    const state = searchBoxSlice.reducer(
      initialSearchBoxState,
      SearchBoxActions.setQuery('laptops')
    );

    expect(state.query).toBe('laptops');
  });

  it('should accept empty string', () => {
    const state = searchBoxSlice.reducer(
      {query: 'existing'},
      SearchBoxActions.setQuery('')
    );

    expect(state.query).toBe('');
  });

  it('should maintain state immutability', () => {
    const original = {...initialSearchBoxState};
    searchBoxSlice.reducer(original, SearchBoxActions.setQuery('test'));

    // Original should not be mutated
    expect(original.query).toBe('');
  });
});
