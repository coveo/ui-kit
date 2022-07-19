import {
  buildTab,
  Tab,
  TabInitialState,
  TabOptions,
} from './headless-insight-tab';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';

describe('insight Tab', () => {
  let engine: MockInsightEngine;
  let options: TabOptions;
  let initialState: TabInitialState;
  let tab: Tab;

  function initTab() {
    tab = buildTab(engine, {options, initialState});
  }
  beforeEach(() => {
    engine = buildMockInsightEngine();
    options = {
      expression: '123',
      id: 'All',
    };
    initialState = {
      isActive: false,
    };

    initTab();
  });

  it('initializes', () => {
    expect(tab).toBeTruthy();
  });

  describe('#select', () => {
    it('dispatches #executeSearch', () => {
      tab.select();
      const action = engine.findAsyncAction(executeSearch.pending);
      expect(action).toBeTruthy();
    });
  });
});
