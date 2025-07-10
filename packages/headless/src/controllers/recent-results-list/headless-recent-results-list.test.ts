import {
  clearRecentResults,
  registerRecentResults,
} from '../../features/recent-results/recent-results-actions.js';
import {logClearRecentResults} from '../../features/recent-results/recent-results-analytics-actions.js';
import {recentResultsReducer as recentResults} from '../../features/recent-results/recent-results-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockResult} from '../../test/mock-result.js';
import {createMockState} from '../../test/mock-state.js';
import {
  buildRecentResultsList,
  type RecentResultsList,
} from './headless-recent-results-list.js';

vi.mock('../../features/recent-results/recent-results-analytics-actions');
vi.mock('../../features/recent-results/recent-results-actions');

describe('recent results list', () => {
  let engine: MockedSearchEngine;
  let recentResultsList: RecentResultsList;

  const resultStringParams = {
    title: 'title',
    uri: 'uri',
    printableUri: 'printable-uri',
    clickUri: 'click-uri',
    uniqueId: 'unique-id',
    excerpt: 'excerpt',
    firstSentences: 'first-sentences',
    flags: 'flags',
  };

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
  });

  it('adds the correct reducers to the engine', () => {
    recentResultsList = buildRecentResultsList(engine);

    expect(engine.addReducers).toHaveBeenCalledWith({recentResults});
  });

  describe('without props', () => {
    beforeEach(() => {
      recentResultsList = buildRecentResultsList(engine);
    });

    it('should register with default props on init', () => {
      expect(registerRecentResults).toHaveBeenCalledWith({
        results: [],
        maxLength: 10,
      });
    });

    it('#state.results initial state is empty', () => {
      expect(recentResultsList.state.results.length).toBe(0);
    });

    it('#state.maxLength initial state is 10', () => {
      expect(recentResultsList.state.maxLength).toBe(10);
    });
  });

  describe('with props', () => {
    const testInitialState = {
      results: [
        buildMockResult({...resultStringParams, uniqueId: '1'}),
        buildMockResult({...resultStringParams, uniqueId: '2'}),
      ],
    };
    const testOptions = {
      maxLength: 5,
    };
    const testProps = {
      initialState: testInitialState,
      options: testOptions,
    };

    beforeEach(() => {
      recentResultsList = buildRecentResultsList(engine, testProps);
    });

    it('should register with props on init', () => {
      expect(registerRecentResults).toHaveBeenCalledWith({
        results: testProps.initialState.results,
        maxLength: testProps.options.maxLength,
      });
    });

    it('#clear should log analytics and dispatch clear action', () => {
      recentResultsList.clear();
      expect(clearRecentResults).toHaveBeenCalled();
      expect(logClearRecentResults).toHaveBeenCalled();
    });
  });
});
