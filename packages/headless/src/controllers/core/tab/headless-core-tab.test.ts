import {configuration} from '../../../app/common-reducers.js';
import {getConfigurationInitialState} from '../../../features/configuration/configuration-state.js';
import {
  registerTab,
  updateActiveTab,
} from '../../../features/tab-set/tab-set-actions.js';
import {tabSetReducer as tabSet} from '../../../features/tab-set/tab-set-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {buildMockTabSlice} from '../../../test/mock-tab-state.js';
import {buildCoreTab, type Tab, type TabProps} from './headless-core-tab.js';

vi.mock('../../../features/tab-set/tab-set-actions');

describe('Core Tab', () => {
  let engine: MockedSearchEngine;
  let props: TabProps;
  let tab: Tab;

  function initTab() {
    tab = buildCoreTab(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    props = {
      options: {
        expression: '@objecttype==Message',
        id: 'All',
      },
      initialState: {
        isActive: false,
      },
    };

    initTab();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      tabSet,
    });
  });

  it('when the #id option is an empty string, it throws', () => {
    props.options.id = '';
    expect(() => initTab()).toThrow();
  });

  it('when the #id option is set to default originLevel2 value, it throws', () => {
    props.options.id = getConfigurationInitialState().analytics.originLevel2;
    expect(() => initTab()).toThrow();
  });

  describe('initialization', () => {
    it('dispatches #registerTab', () => {
      initTab();

      const {id, expression} = props.options;
      expect(registerTab).toHaveBeenCalledWith({id, expression});
    });

    it('when isActive is true, it dispatches #updateActiveTab', () => {
      const {id} = props.options;
      props.initialState!.isActive = true;
      initTab();

      expect(updateActiveTab).toHaveBeenCalledWith(id);
    });

    it('does not throw if initialState is undefined', () => {
      props = {
        options: {
          expression: '@objecttype==Message',
          id: 'All',
        },
      };

      expect(() => initTab()).not.toThrow();
    });

    it('when initialState #isActive is an invalid value, it throws an error', () => {
      props.initialState = {isActive: '' as unknown as boolean};
      expect(() => initTab()).toThrow('Check the initialState of buildTab');
    });

    it('when options #expression is an invalid value, it throws an error', () => {
      props.options.expression = 1 as unknown as string;
      expect(() => initTab()).toThrow('Check the options of buildTab');
    });
  });

  describe('#select', () => {
    it('dispatches #updateActiveTab', () => {
      const {id} = props.options;
      tab.select();
      expect(updateActiveTab).toHaveBeenCalledWith(id);
    });
  });

  it('when the entry in the tabSet is not active, #state.isActive is false', () => {
    const {id} = props.options;
    engine.state.tabSet![id] = buildMockTabSlice({id, isActive: false});
    expect(tab.state.isActive).toBe(false);
  });

  it('when the entry in the tabSet is active, #state.isActive is true', () => {
    const {id} = props.options;
    engine.state.tabSet![id] = buildMockTabSlice({id, isActive: true});
    expect(tab.state.isActive).toBe(true);
  });
});
