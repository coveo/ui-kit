import {describe, it, expect} from 'vitest';
import {
  createResultsSlice,
  getOrCreateResultsSlice,
  initialResultListState,
} from './result-list-slice.js';
import {
  createResultsActions,
  getOrCreateResultsActions,
} from './result-list-actions.js';
import {
  createResultsSelectors,
  getOrCreateResultsSelectors,
} from './result-list-selectors.js';
import type {CoveoSearchResult} from '@/src/core/interface/api/search/search-types.js';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/core/interface/generative/generative-hydration.js';

const sharedEngine = createTestEngine();
const ifaceCache = new Map<string, ReturnType<typeof createTestInterface>>();
function iface(id: string) {
  if (!ifaceCache.has(id)) {
    ifaceCache.set(id, createTestInterface(sharedEngine, id));
  }
  return ifaceCache.get(id)!;
}

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

describe('createResultsActions', () => {
  it('should create actions scoped to the given interfaceId', () => {
    const actions = createResultsActions('search-1');

    expect(actions.setResultsFromResponse.type).toBe(
      'search-1/results/setResultsFromResponse'
    );
  });

  it('should create independent actions for different interfaceIds', () => {
    const actions1 = createResultsActions('interface-a');
    const actions2 = createResultsActions('interface-b');

    expect(actions1.setResultsFromResponse.type).not.toBe(
      actions2.setResultsFromResponse.type
    );
  });
});

describe('getOrCreateResultsActions', () => {
  it('should return the same reference for the same interfaceId', () => {
    const testInterface = iface('cached-results-actions');
    const first = getOrCreateResultsActions(testInterface);
    const second = getOrCreateResultsActions(testInterface);

    expect(first).toBe(second);
  });

  it('should return different references for different interfaceIds', () => {
    const a = getOrCreateResultsActions(iface('results-actions-x'));
    const b = getOrCreateResultsActions(iface('results-actions-y'));

    expect(a).not.toBe(b);
  });
});

describe('createResultsSlice', () => {
  it('should create a slice scoped to the interfaceId', () => {
    const testInterface = iface('my-interface');
    const actions = getOrCreateResultsActions(testInterface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(testInterface);
    const slice = createResultsSlice('my-interface', actions, hydrateAction);

    expect(slice.name).toBe('my-interface/results');
  });

  it('should handle setResultsFromResponse action', () => {
    const testInterface = iface('test-handle');
    const actions = getOrCreateResultsActions(testInterface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(testInterface);
    const slice = createResultsSlice('test-handle', actions, hydrateAction);

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
    const testInterface = iface('map-test');
    const actions = getOrCreateResultsActions(testInterface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(testInterface);
    const slice = createResultsSlice('map-test', actions, hydrateAction);

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
    const testInterface = iface('replace-test');
    const actions = getOrCreateResultsActions(testInterface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(testInterface);
    const slice = createResultsSlice('replace-test', actions, hydrateAction);

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
    const testIfaceA = iface('slice-a');
    const testIfaceB = iface('slice-b');
    const actionsA = getOrCreateResultsActions(testIfaceA);
    const hydrateActionA = getOrCreateHydrateFromSnapshotAction(testIfaceA);
    const slice = createResultsSlice('slice-a', actionsA, hydrateActionA);
    const actionsB = getOrCreateResultsActions(testIfaceB);

    const state = slice.reducer(
      initialResultListState,
      actionsB.setResultsFromResponse([mockCoveoResult()])
    );

    expect(state.results).toEqual([]);
  });
});

describe('getOrCreateResultsSlice', () => {
  it('should return the same reference for the same interfaceId', () => {
    const first = getOrCreateResultsSlice(iface('cached-slice'));
    const second = getOrCreateResultsSlice(iface('cached-slice'));

    expect(first).toBe(second);
  });

  it('should return different references for different interfaceIds', () => {
    const a = getOrCreateResultsSlice(iface('slice-x'));
    const b = getOrCreateResultsSlice(iface('slice-y'));

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
    const first = getOrCreateResultsSelectors(iface('cached-sel'));
    const second = getOrCreateResultsSelectors(iface('cached-sel'));

    expect(first).toBe(second);
  });

  it('should return different references for different interfaceIds', () => {
    const a = getOrCreateResultsSelectors(iface('sel-a'));
    const b = getOrCreateResultsSelectors(iface('sel-b'));

    expect(a).not.toBe(b);
  });
});
