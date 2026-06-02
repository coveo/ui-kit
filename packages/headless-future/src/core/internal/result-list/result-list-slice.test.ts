import {describe, it, expect} from 'vitest';
import {resultsSlice, initialResultListState} from './result-list-slice.js';
import * as ResultListActions from './result-list-actions.js';
import type {SearchResult} from '@/src/core/interface/result-list/result-list-types.js';

const mockResult = (overrides: Partial<SearchResult> = {}): SearchResult => ({
  uniqueId: '1',
  title: 'Test',
  uri: 'test',
  excerpt: 'test',
  printableUri: 'test',
  clickUri: 'test',
  raw: {},
  score: 0,
  ...overrides,
});

describe('resultsSlice: initialState', () => {
  it('should have correct initial state', () => {
    expect(initialResultListState).toEqual({
      results: [],
    });
  });
});

describe('resultsSlice: setResults', () => {
  it('should update results array', () => {
    const results: SearchResult[] = [
      mockResult({
        uniqueId: '1',
        title: 'Result 1',
        uri: 'uri1',
        excerpt: 'excerpt1',
      }),
      mockResult({
        uniqueId: '2',
        title: 'Result 2',
        uri: 'uri2',
        excerpt: 'excerpt2',
      }),
    ];

    const state = resultsSlice.reducer(
      initialResultListState,
      ResultListActions.setResults(results)
    );

    expect(state.results).toEqual(results);
    expect(state.results.length).toBe(2);
  });

  it('should replace previous results completely', () => {
    const oldState = {
      ...initialResultListState,
      results: [
        mockResult({uniqueId: 'old', title: 'Old', uri: 'old', excerpt: 'old'}),
      ],
    };

    const newResults: SearchResult[] = [
      mockResult({uniqueId: 'new', title: 'New', uri: 'new', excerpt: 'new'}),
    ];

    const state = resultsSlice.reducer(
      oldState,
      ResultListActions.setResults(newResults)
    );

    expect(state.results).toEqual(newResults);
    expect(state.results.length).toBe(1);
  });

  it('should accept empty array', () => {
    const oldState = {
      ...initialResultListState,
      results: [mockResult()],
    };

    const state = resultsSlice.reducer(
      oldState,
      ResultListActions.setResults([])
    );

    expect(state.results).toEqual([]);
  });
});

describe('resultsSlice: clearResults', () => {
  it('should clear results array', () => {
    const stateWithResults = {
      ...initialResultListState,
      results: [
        mockResult({uniqueId: '1'}),
        mockResult({
          uniqueId: '2',
          title: 'Test 2',
          uri: 'test2',
          excerpt: 'test2',
        }),
      ],
    };

    const state = resultsSlice.reducer(
      stateWithResults,
      ResultListActions.clearResults()
    );

    expect(state.results).toEqual([]);
  });
});

describe('resultsSlice: state immutability', () => {
  it('should not mutate original state for any action', () => {
    const original = {...initialResultListState};

    resultsSlice.reducer(
      original,
      ResultListActions.setResults([mockResult()])
    );

    expect(original.results).toEqual([]);
  });
});
