import {configuration} from '../../../app/common-reducers';
import {getConfigurationInitialState} from '../../../features/configuration/configuration-state';
import {
  registerTab,
  updateActiveTab,
} from '../../../features/tab-set/tab-set-actions';
import {tabSetReducer as tabSet} from '../../../features/tab-set/tab-set-slice';
import {MockSearchEngine} from '../../../test/mock-engine';
import {buildMockSearchAppEngine} from '../../../test/mock-engine';
import {buildMockTabSlice} from '../../../test/mock-tab-state';
import {buildCoreTab, Tab, TabProps} from './headless-core-tab';

describe('Core Tab', () => {
  let engine: MockSearchEngine;
  let props: TabProps;
  let tab: Tab;

  function initTab() {
    tab = buildCoreTab(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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
      const action = registerTab({id, expression});
      expect(engine.actions).toContainEqual(action);
    });

    it('when isActive is true, it dispatches #updateActiveTab', () => {
      const {id} = props.options;
      props.initialState!.isActive = true;
      initTab();

      expect(engine.actions).toContainEqual(updateActiveTab(id));
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

      expect(engine.actions).toContainEqual(updateActiveTab(id));
    });
  });

  it('when the entry in the tabSet is not active, #state.isActive is false', () => {
    const {id} = props.options;
    engine.state.tabSet[id] = buildMockTabSlice({id, isActive: false});
    expect(tab.state.isActive).toBe(false);
  });

  it('when the entry in the tabSet is active, #state.isActive is true', () => {
    const {id} = props.options;
    engine.state.tabSet[id] = buildMockTabSlice({id, isActive: true});
    expect(tab.state.isActive).toBe(true);
  });
});
