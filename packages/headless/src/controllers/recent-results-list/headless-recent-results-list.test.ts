import {
  buildMockResult,
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test';
import {
  buildRecentResultsList,
  RecentResultsList,
} from './headless-recent-results-list';
import {recentResults} from '../../app/reducers';
import {
  clearRecentResults,
  pushRecentResult,
  registerRecentResults,
} from '../../features/recent-results/recent-results-actions';
import {Action} from 'redux';
import {
  logClearRecentResults,
  logRecentResultClickThunk,
} from '../../features/recent-results/recent-results-analytics-actions';
import {NumberValue} from '@coveo/bueno';

describe('recent results list', () => {
  let engine: MockSearchEngine;
  let recentResultsList: RecentResultsList;

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(found).toBeDefined();
  };

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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
      expect(engine.actions).toContainEqual(
        registerRecentResults({
          results: [],
          maxLength: 10,
        })
      );
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
        buildMockResult({uniqueId: '1'}),
        buildMockResult({uniqueId: '2'}),
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
      expect(engine.actions).toContainEqual(
        registerRecentResults({
          results: testProps.initialState.results,
          maxLength: testProps.options.maxLength,
        })
      );
    });

    it('#clear should log analytics and dispatch clear action', () => {
      recentResultsList.clear();

      expectContainAction(clearRecentResults);
      expect(recentResultsList.state.results.length).toBe(0);
      expect(
        engine.findAsyncAction(logClearRecentResults.pending)
      ).toBeDefined();
    });

    it('#handleRecentResultClick should validate the given index parameter', () => {
      const validationSpy = spyOn(
        NumberValue.prototype,
        'validate'
      ).and.callThrough();
      engine.state.recentResults = {...testInitialState, ...testOptions};

      expect(() => recentResultsList.handleRecentResultClick(100)).toThrow();
      expect(validationSpy).toBeCalled();
    });

    it('#handleRecentResultClick should execute the result and log proper analytics', () => {
      const testIndex = 0;
      engine.state.recentResults = {...testInitialState, ...testOptions};
      recentResultsList.handleRecentResultClick(testIndex);

      expectContainAction(pushRecentResult);
      const logAction = engine.actions.find(
        (action) =>
          action.type ===
          logRecentResultClickThunk(testInitialState.results[testIndex]).pending
            .type
      );
      expect(logAction).toBeDefined();
    });
  });
});
