import {executeSearch} from '../../features/search/search-actions';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {buildTab, Tab, TabProps} from './headless-tab';

jest.mock('../../features/search/search-actions');

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
      tab.select(true);
      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
