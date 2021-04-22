import {MockEngine, buildMockSearchAppEngine} from '../../test/mock-engine';
import {TabProps, buildTab, Tab} from './headless-tab';
import {
  registerAdvancedSearchQueries,
  updateAdvancedSearchQueries,
} from '../../features/advanced-search-queries/advanced-search-queries-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockAdvancedSearchQueriesState} from '../../test/mock-advanced-search-queries-state';
import {advancedSearchQueries, configuration} from '../../app/reducers';

describe('Tab', () => {
  const expression = 'abc123';
  let engine: MockEngine<SearchAppState>;
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
      },
      initialState: {
        isActive: false,
      },
    };
  });

  it('it adds the correct reducers to engine', () => {
    initTab();

    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      advancedSearchQueries,
    });
  });

  describe('initalization', () => {
    it('calls #registerAdvancedSearchQueries if isActive is true', () => {
      props = {
        options: {
          expression,
        },
        initialState: {
          isActive: true,
        },
      };
      initTab();

      const action = registerAdvancedSearchQueries({cq: expression});
      expect(engine.actions).toContainEqual(action);
    });

    it('does not throw if initialState is undefined', () => {
      props = {
        options: {
          expression,
        },
      };

      expect(() => initTab()).not.toThrow();
    });

    it('when initialState #isActive is an invalid value, it throws an error', () => {
      props.initialState = {isActive: ('' as unknown) as boolean};
      expect(() => initTab()).toThrow('Check the initialState of buildTab');
    });

    it('when options #expression is an invalid value, it throws an error', () => {
      props.options = {expression: (1 as unknown) as string};
      expect(() => initTab()).toThrow('Check the options of buildTab');
    });
  });

  it('#select calls #updateConstantQuery', () => {
    initTab();
    tab.select();
    const action = updateAdvancedSearchQueries({cq: expression});
    expect(engine.actions).toContainEqual(action);
  });

  it('#state.isActive is false by default', () => {
    initTab();
    expect(tab.state.isActive).toBe(false);
  });

  it('#state.isActive is true if the tabs cq matches the active cq', () => {
    props.options.expression = 'abc123';
    initTab();
    engine.state.advancedSearchQueries.cq = props.options.expression;
    expect(tab.state.isActive).toBe(true);
  });
});
