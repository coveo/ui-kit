import {
  MockSearchEngine,
  buildMockSearchAppEngine,
} from '../../test/mock-engine';
import {buildTab} from './headless-tab';
import {buildMockAdvancedSearchQueriesState} from '../../test/mock-advanced-search-queries-state';
import {updateActiveTab} from '../../features/tab-set/tab-set-actions';
import {executeSearch} from '../../features/search/search-actions';
import {Tab, TabProps} from '../core/tab/headless-core-tab';

describe('Tab', () => {
  const expression = 'abc123';
  let engine: MockSearchEngine;
  let props: TabProps;
  let tab: Tab;

  function initTab() {
    tab = buildTab(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    engine.state.advancedSearchQueries = buildMockAdvancedSearchQueriesState();
    props = {
      options: {
        expression,
        id: 'All',
      },
      initialState: {
        isActive: false,
      },
    };

    initTab();
  });
  describe('#select', () => {
    it('dispatches #updateActiveTab', () => {
      const {id} = props.options;
      tab.select();

      expect(engine.actions).toContainEqual(updateActiveTab(id));
    });

    it('dispatches #executeSearch', () => {
      tab.select();
      const action = engine.findAsyncAction(executeSearch.pending);
      expect(action).toBeTruthy();
    });
  });
});
