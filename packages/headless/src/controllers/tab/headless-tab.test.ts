import {
  MockSearchEngine,
  buildMockSearchAppEngine,
} from '../../test/mock-engine';
import {executeSearch} from '../../features/search/search-actions';
import {buildTab, Tab, TabProps} from './headless-tab';

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
