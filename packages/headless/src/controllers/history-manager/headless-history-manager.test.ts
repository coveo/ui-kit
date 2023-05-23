import {configuration} from '../../app/common-reducers';
import {facetOrderReducer as facetOrder} from '../../features/facets/facet-order/facet-order-slice';
import {
  back,
  forward,
  redo,
  undo,
} from '../../features/history/history-actions';
import {history} from '../../features/history/history-slice';
import {
  extractHistory,
  getHistoryInitialState,
} from '../../features/history/history-state';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildHistoryManager, HistoryManager} from './headless-history-manager';

describe('History Manager', () => {
  let engine: MockSearchEngine;
  let historyManager: HistoryManager;

  function initHistoryManager() {
    historyManager = buildHistoryManager(engine);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initHistoryManager();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      history,
      facetOrder,
    });
  });

  it("won't navigate backwards when there is no past history", () => {
    historyManager.back();
    expect(engine.actions.length).toBe(0);
  });

  it("won't navigate backwards on no results when there is no past history", () => {
    historyManager.backOnNoResults();
    expect(engine.actions.length).toBe(0);
  });

  it('should allow to navigate backward when there is a past history', () => {
    engine.state.history.present = getHistoryInitialState();
    engine.state.history.past = [extractHistory({pipeline: 'test'})];
    initHistoryManager();

    historyManager.back();

    expect(engine.actions[0].type).toBe(back.pending.type);
    expect(engine.actions[1].type).toBe(undo().type);
  });

  it('should allow to navigate backward on no results when there is a past history', () => {
    engine.state.history.present = getHistoryInitialState();
    engine.state.history.past = [extractHistory({pipeline: 'test'})];
    initHistoryManager();

    historyManager.backOnNoResults();

    expect(engine.actions[0].type).toBe(back.pending.type);
    expect(engine.actions[1].type).toBe(undo().type);
  });

  it("won't navigate backwards when there is no future history", () => {
    historyManager.forward();
    expect(engine.actions.length).toBe(0);
  });

  it('should allow to navigate forward when there is a future history', () => {
    engine.state.history.present = getHistoryInitialState();
    engine.state.history.future = [extractHistory({pipeline: 'test'})];
    initHistoryManager();

    historyManager.forward();

    expect(engine.actions[0].type).toBe(forward.pending.type);
    expect(engine.actions[1].type).toBe(redo().type);
  });
});
