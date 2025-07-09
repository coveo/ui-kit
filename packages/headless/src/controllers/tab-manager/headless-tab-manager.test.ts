import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {buildTabManager, type TabManager} from './headless-tab-manager.js';

vi.mock('../../features/search/search-actions');

describe('Tab', () => {
  let engine: MockedSearchEngine;
  let tabManager: TabManager;

  function initTabManager() {
    tabManager = buildTabManager(engine);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());

    initTabManager();
  });

  it('initializes', () => {
    expect(tabManager).toBeTruthy();
  });
});
