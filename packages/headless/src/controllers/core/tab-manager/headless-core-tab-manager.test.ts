import {tabSetReducer as tabSet} from '../../../features/tab-set/tab-set-slice';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {createMockState} from '../../../test/mock-state';
import {buildCoreTabManager} from './headless-core-tab-manager';

jest.mock('../../../features/tab-set/tab-set-actions');

describe('Core Tab Manager', () => {
  let engine: MockedSearchEngine;

  function initTabManager() {
    buildCoreTabManager(engine);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    initTabManager();
  });

  it('returns the current active tab', () => {
    expect(engine.state.tabSet).toEqual({});

    const tabId = '1';
    const expectedTabSet = {
      [tabId]: {
        id: tabId,
        expression: 'test',
        isActive: true,
      },
    };

    engine.state.tabSet = expectedTabSet;

    expect(engine.state.tabSet).toEqual(expectedTabSet);
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      tabSet,
    });
  });
});
