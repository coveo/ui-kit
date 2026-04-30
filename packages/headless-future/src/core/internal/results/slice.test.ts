/**
 * Results Slice Tests
 */

import {describe, it, expect} from 'vitest';
import {resultsSlice, initialResultsState} from './slice.js';
import type {SearchResult} from '@/src/core/interface/result/types.js';

describe('resultsSlice: initialState', () => {
  it('should have correct initial state', () => {
    expect(initialResultsState).toEqual({
      results: [],
      isLoading: false,
      error: null,
    });
  });
});

describe('resultsSlice: setResults', () => {
  it('should update results array', () => {
    const results: SearchResult[] = [
      {id: '1', title: 'Result 1', uri: 'uri1', excerpt: 'excerpt1'},
      {id: '2', title: 'Result 2', uri: 'uri2', excerpt: 'excerpt2'},
    ];

    const state = resultsSlice.reducer(
      initialResultsState,
      resultsSlice.actions.setResults(results)
    );

    expect(state.results).toEqual(results);
    expect(state.results.length).toBe(2);
  });

  it('should replace previous results completely', () => {
    const oldState = {
      ...initialResultsState,
      results: [{id: 'old', title: 'Old', uri: 'old', excerpt: 'old'}],
    };

    const newResults: SearchResult[] = [
      {id: 'new', title: 'New', uri: 'new', excerpt: 'new'},
    ];

    const state = resultsSlice.reducer(
      oldState,
      resultsSlice.actions.setResults(newResults)
    );

    expect(state.results).toEqual(newResults);
    expect(state.results.length).toBe(1);
  });

  it('should accept empty array', () => {
    const oldState = {
      ...initialResultsState,
      results: [{id: '1', title: 'Test', uri: 'test', excerpt: 'test'}],
    };

    const state = resultsSlice.reducer(
      oldState,
      resultsSlice.actions.setResults([])
    );

    expect(state.results).toEqual([]);
  });
});

describe('resultsSlice: setLoading', () => {
  it('should set loading to true', () => {
    const state = resultsSlice.reducer(
      initialResultsState,
      resultsSlice.actions.setLoading(true)
    );

    expect(state.isLoading).toBe(true);
  });

  it('should set loading to false', () => {
    const loadingState = {...initialResultsState, isLoading: true};

    const state = resultsSlice.reducer(
      loadingState,
      resultsSlice.actions.setLoading(false)
    );

    expect(state.isLoading).toBe(false);
  });

  it('should toggle loading state', () => {
    let state = initialResultsState;

    state = resultsSlice.reducer(state, resultsSlice.actions.setLoading(true));
    expect(state.isLoading).toBe(true);

    state = resultsSlice.reducer(state, resultsSlice.actions.setLoading(false));
    expect(state.isLoading).toBe(false);
  });
});

describe('resultsSlice: setError', () => {
  it('should set error message', () => {
    const state = resultsSlice.reducer(
      initialResultsState,
      resultsSlice.actions.setError('Search failed')
    );

    expect(state.error).toBe('Search failed');
  });

  it('should clear error with null', () => {
    const errorState = {...initialResultsState, error: 'Previous error'};

    const state = resultsSlice.reducer(
      errorState,
      resultsSlice.actions.setError(null)
    );

    expect(state.error).toBeNull();
  });

  it('should replace previous error', () => {
    const errorState = {...initialResultsState, error: 'Old error'};

    const state = resultsSlice.reducer(
      errorState,
      resultsSlice.actions.setError('New error')
    );

    expect(state.error).toBe('New error');
  });
});

describe('resultsSlice: clearResults', () => {
  it('should clear results array', () => {
    const stateWithResults = {
      ...initialResultsState,
      results: [
        {id: '1', title: 'Test', uri: 'test', excerpt: 'test'},
        {id: '2', title: 'Test 2', uri: 'test2', excerpt: 'test2'},
      ],
    };

    const state = resultsSlice.reducer(
      stateWithResults,
      resultsSlice.actions.clearResults()
    );

    expect(state.results).toEqual([]);
  });

  it('should clear error', () => {
    const stateWithError = {
      ...initialResultsState,
      error: 'Some error',
      results: [{id: '1', title: 'Test', uri: 'test', excerpt: 'test'}],
    };

    const state = resultsSlice.reducer(
      stateWithError,
      resultsSlice.actions.clearResults()
    );

    expect(state.error).toBeNull();
    expect(state.results).toEqual([]);
  });

  it('should not affect loading state', () => {
    const stateWithData = {
      ...initialResultsState,
      isLoading: true,
      results: [{id: '1', title: 'Test', uri: 'test', excerpt: 'test'}],
      error: 'error message',
    };

    const state = resultsSlice.reducer(
      stateWithData,
      resultsSlice.actions.clearResults()
    );

    expect(state.isLoading).toBe(true);
    expect(state.results).toEqual([]);
    expect(state.error).toBeNull();
  });
});

describe('resultsSlice: state immutability', () => {
  it('should not mutate original state for any action', () => {
    const original = {...initialResultsState};

    resultsSlice.reducer(original, resultsSlice.actions.setLoading(true));
    expect(original.isLoading).toBe(false);

    resultsSlice.reducer(original, resultsSlice.actions.setError('error'));
    expect(original.error).toBeNull();
  });
});
