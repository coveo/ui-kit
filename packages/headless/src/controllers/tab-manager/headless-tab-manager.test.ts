import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {buildTabManager, TabManager} from './headless-tab-manager';

jest.mock('../../features/search/search-actions');

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
