import {executeSearch} from '../../features/search/search-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {buildTab, type Tab, type TabProps} from './headless-tab.js';

vi.mock('../../features/search/search-actions');

describe('Tab', () => {
  const expression = 'abc123';
  let engine: MockedSearchEngine;
  let props: TabProps;
  let tab: Tab;

  function initTab() {
    tab = buildTab(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
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
      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
