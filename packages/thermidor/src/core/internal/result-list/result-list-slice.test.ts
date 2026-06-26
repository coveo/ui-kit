import {describe, it, expect} from 'vitest';
import {
  getOrCreateResultsSlice,
  initialResultListState,
} from './result-list-slice.js';
import {getOrCreateResultsActions} from './result-list-actions.js';
import {
  createResultsSelectors,
  getOrCreateResultsSelectors,
} from './result-list-selectors.js';
import type {CoveoSearchResult} from '@/src/core/interface/api/search/search-types.js';

const mockCoveoResult = (
  overrides: Partial<CoveoSearchResult> = {}
): CoveoSearchResult => ({
  uniqueId: '1',
  title: 'Test',
  uri: 'test',
  excerpt: 'test excerpt',
  printableUri: 'test',
  clickUri: 'test',
  raw: {},
  score: 0,
  ...overrides,
});

describe('initialResultListState', () => {
  it('should have correct initial state', () => {
    expect(initialResultListState).toEqual({
      results: [],
    });
  });
});

describe('getOrCreateResultsActions', () => {
  it('should return the same reference for the same interfaceId', () => {
    const first = getOrCreateResultsActions('cached-id');
    const second = getOrCreateResultsActions('cached-id');

    expect(first).toBe(second);
  });

  it('should return different references for different interfaceIds', () => {
    const a = getOrCreateResultsActions('id-a');
    const b = getOrCreateResultsActions('id-b');

    expect(a).not.toBe(b);
  });
});

describe('getOrCreateResultsSlice', () => {
  it('should create a slice scoped to the interfaceId', () => {
    const slice = getOrCreateResultsSlice('my-interface');

    expect(slice.name).toBe('my-interface/results');
  });

  it('should handle setResultsFromResponse action', () => {
    const slice = getOrCreateResultsSlice('test');
    const actions = getOrCreateResultsActions('test');

    const coveoResults: CoveoSearchResult[] = [
      mockCoveoResult({uniqueId: '1', title: 'Result 1'}),
      mockCoveoResult({uniqueId: '2', title: 'Result 2'}),
    ];

    const state = slice.reducer(
      initialResultListState,
      actions.setResultsFromResponse(coveoResults)
    );

    expect(state.results).toHaveLength(2);
    expect(state.results[0].uniqueId).toBe('1');
    expect(state.results[0].title).toBe('Result 1');
    expect(state.results[1].uniqueId).toBe('2');
    expect(state.results[1].title).toBe('Result 2');
  });

  it('should map CoveoSearchResult fields correctly', () => {
    const slice = getOrCreateResultsSlice('map-test');
    const actions = getOrCreateResultsActions('map-test');

    const coveoResult = mockCoveoResult({
      uniqueId: 'abc',
      title: 'My Title',
      uri: 'https://example.com',
      excerpt: 'An excerpt',
      printableUri: 'example.com',
      clickUri: 'https://example.com/click',
      raw: {source: 'web'},
      score: 42,
    });

    const state = slice.reducer(
      initialResultListState,
      actions.setResultsFromResponse([coveoResult])
    );

    expect(state.results[0]).toEqual({
      uniqueId: 'abc',
      title: 'My Title',
      uri: 'https://example.com',
      excerpt: 'An excerpt',
      printableUri: 'example.com',
      clickUri: 'https://example.com/click',
      raw: {source: 'web'},
      score: 42,
    });
  });

  it('should replace previous results completely', () => {
    const slice = getOrCreateResultsSlice('replace-test');
    const actions = getOrCreateResultsActions('replace-test');

    const oldState = {
      results: [
        {
          uniqueId: 'old',
          title: 'Old',
          uri: 'old',
          excerpt: 'old',
          printableUri: 'old',
          clickUri: 'old',
          raw: {},
          score: 0,
        },
      ],
    };

    const state = slice.reducer(
      oldState,
      actions.setResultsFromResponse([
        mockCoveoResult({uniqueId: 'new', title: 'New'}),
      ])
    );

    expect(state.results).toHaveLength(1);
    expect(state.results[0].uniqueId).toBe('new');
  });

  it('should not respond to actions from a different interfaceId', () => {
    const slice = getOrCreateResultsSlice('slice-a');
    const actionsB = getOrCreateResultsActions('slice-b');

    const state = slice.reducer(
      initialResultListState,
      actionsB.setResultsFromResponse([mockCoveoResult()])
    );

    expect(state.results).toEqual([]);
  });

  it('should return the same reference for the same interfaceId', () => {
    const first = getOrCreateResultsSlice('cached-slice');
    const second = getOrCreateResultsSlice('cached-slice');

    expect(first).toBe(second);
  });

  it('should return different references for different interfaceIds', () => {
    const a = getOrCreateResultsSlice('slice-x');
    const b = getOrCreateResultsSlice('slice-y');

    expect(a).not.toBe(b);
  });
});

describe('createResultsSelectors', () => {
  it('should return initial results when slice is not in state', () => {
    const selectors = createResultsSelectors('sel-test');
    const state = {};

    const results = selectors.getResults(state);

    expect(results).toEqual([]);
  });

  it('should return results from scoped state', () => {
    const selectors = createResultsSelectors('sel-test-2');
    const mockResults = [
      {
        uniqueId: '1',
        title: 'Test',
        uri: 'test',
        excerpt: 'test',
        printableUri: 'test',
        clickUri: 'test',
        raw: {},
        score: 0,
      },
    ];
    const state = {'sel-test-2/results': {results: mockResults}};

    const results = selectors.getResults(state);

    expect(results).toEqual(mockResults);
  });
});

describe('getOrCreateResultsSelectors', () => {
  it('should return the same reference for the same interfaceId', () => {
    const first = getOrCreateResultsSelectors('cached-sel');
    const second = getOrCreateResultsSelectors('cached-sel');

    expect(first).toBe(second);
  });

  it('should return different references for different interfaceIds', () => {
    const a = getOrCreateResultsSelectors('sel-a');
    const b = getOrCreateResultsSelectors('sel-b');

    expect(a).not.toBe(b);
  });
});
