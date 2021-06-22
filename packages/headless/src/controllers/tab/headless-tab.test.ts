import {
  MockSearchEngine,
  buildMockSearchAppEngine,
} from '../../test/mock-engine';
import {TabProps, buildTab, Tab} from './headless-tab';
import {
  registerAdvancedSearchQueries,
  updateAdvancedSearchQueries,
} from '../../features/advanced-search-queries/advanced-search-queries-actions';
import {buildMockAdvancedSearchQueriesState} from '../../test/mock-advanced-search-queries-state';
import {advancedSearchQueries, configuration} from '../../app/reducers';
import {setOriginLevel2} from '../../features/configuration/configuration-actions';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';

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
      advancedSearchQueries,
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
    it('calls #registerAdvancedSearchQueries if isActive is true', () => {
      props.initialState!.isActive = true;
      initTab();

      const action = registerAdvancedSearchQueries({cq: expression});
      expect(engine.actions).toContainEqual(action);
    });

    it('when isActive is true, it sets originLevel2 to the #id option', () => {
      props.initialState!.isActive = true;
      initTab();

      const action = setOriginLevel2({originLevel2: props.options.id!});
      expect(engine.actions).toContainEqual(action);
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
      props.initialState = {isActive: ('' as unknown) as boolean};
      expect(() => initTab()).toThrow('Check the initialState of buildTab');
    });

    it('when options #expression is an invalid value, it throws an error', () => {
      props.options.expression = (1 as unknown) as string;
      expect(() => initTab()).toThrow('Check the options of buildTab');
    });
  });

  it('#select calls #updateConstantQuery', () => {
    tab.select();
    const action = updateAdvancedSearchQueries({cq: expression});
    expect(engine.actions).toContainEqual(action);
  });

  it('#select sets the originLevel2 to the #id option', () => {
    tab.select();
    const action = setOriginLevel2({originLevel2: props.options.id!});
    expect(engine.actions).toContainEqual(action);
  });

  it('#state.isActive is false by default', () => {
    expect(tab.state.isActive).toBe(false);
  });

  it('#state.isActive is true if the tabs cq matches the active cq', () => {
    props.options.expression = 'abc123';
    initTab();

    engine.state.advancedSearchQueries.cq = props.options.expression;
    expect(tab.state.isActive).toBe(true);
  });
});
