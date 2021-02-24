import {MockEngine, buildMockSearchAppEngine} from '../../test/mock-engine';
import {TabProps, buildTab, Tab} from './headless-tab';
import {updateAdvancedSearchQueries} from '../../features/advanced-search-queries/advanced-search-queries-actions';
import {SearchAppState} from '../../state/search-app-state';

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
    engine.state.advancedSearchQueries = {aq: '', cq: ''};
    props = {
      options: {
        expression,
      },
      initialState: {
        isActive: false,
      },
    };
  });

  describe('initalization', () => {
    it('calls #registerConstantQuery if isActive is true', () => {
      props = {
        options: {
          expression,
        },
        initialState: {
          isActive: true,
        },
      };
      initTab();

      const action = updateAdvancedSearchQueries({cq: expression});
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
