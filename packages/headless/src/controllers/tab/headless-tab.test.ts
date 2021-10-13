import {
  MockSearchEngine,
  buildMockSearchAppEngine,
} from '../../test/mock-engine';
import {TabProps, buildTab, Tab} from './headless-tab';
import {buildMockAdvancedSearchQueriesState} from '../../test/mock-advanced-search-queries-state';
import {configuration, tabSet} from '../../app/reducers';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';
import {
  registerTab,
  updateActiveTab,
} from '../../features/tab-set/tab-set-actions';
import {executeSearch} from '../../features/search/search-actions';
import {buildMockTabSlice} from '../../test/mock-tab-state';

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
    engine.state.advancedSearchQueries = buildMockAdvancedSearchQueriesState();
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

  it('it adds the correct reducers to engine', () => {
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

  describe('initalization', () => {
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
          expression,
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

    it('dispatches #executeSearch', () => {
      tab.select();
      const action = engine.findAsyncAction(executeSearch.pending);
      expect(action).toBeTruthy();
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
