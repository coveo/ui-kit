import {configuration} from '../../../app/common-reducers';
import {registerTab} from '../../../features/tab-set/tab-set-actions';
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

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      tabSet,
    });
  });

  describe('initialization', () => {
    it('dispatches #registerTabManager', () => {
      initTabManager();

      expect(registerTab).toHaveBeenCalledWith();
    });
  });
});
