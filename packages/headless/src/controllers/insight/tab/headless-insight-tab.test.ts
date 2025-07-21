import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {
  buildTab,
  type Tab,
  type TabInitialState,
  type TabOptions,
} from './headless-insight-tab.js';

vi.mock('../../../features/insight-search/insight-search-actions');

describe('insight Tab', () => {
  let engine: MockedInsightEngine;
  let options: TabOptions;
  let initialState: TabInitialState;
  let tab: Tab;

  function initTab() {
    tab = buildTab(engine, {options, initialState});
  }
  beforeEach(() => {
    engine = buildMockInsightEngine(buildMockInsightState());
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
      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
