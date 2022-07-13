import {buildTab, Tab, TabProps} from './headless-insight-tab';
import {
  registerTab,
  updateActiveTab,
} from '../../../features/tab-set/tab-set-actions';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';

describe('InsightTab', () => {
  let engine: MockInsightEngine;
  let props: TabProps;
  let tab: Tab;

  function initTab() {
    tab = buildTab(engine, props);
  }
  beforeEach(() => {
    engine = buildMockInsightEngine();
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

    it('dispatches #executeSearch', () => {
      tab.select();
      const action = engine.findAsyncAction(executeSearch.pending);
      expect(action).toBeTruthy();
    });
  });
});
