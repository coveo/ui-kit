import {configuration} from '../../app/common-reducers';
import {facetOrderReducer as facetOrder} from '../../features/facets/facet-order/facet-order-slice';
import {back, forward} from '../../features/history/history-actions';
import {history} from '../../features/history/history-slice';
import {
  extractHistory,
  getHistoryInitialState,
} from '../../features/history/history-state';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {buildHistoryManager, HistoryManager} from './headless-history-manager';

jest.mock('../../features/history/history-actions');

describe('History Manager', () => {
  let engine: MockedSearchEngine;
  let historyManager: HistoryManager;

  function initHistoryManager() {
    historyManager = buildHistoryManager(engine);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
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
    expect(back).not.toHaveBeenCalled();
  });

  it("won't navigate backwards on no results when there is no past history", () => {
    historyManager.backOnNoResults();
    expect(back).not.toHaveBeenCalled();
  });

  it('should allow to navigate backward when there is a past history', () => {
    engine.state.history!.present = getHistoryInitialState();
    engine.state.history!.past = [extractHistory({pipeline: 'test'})];
    initHistoryManager();

    historyManager.back();
    expect(back).toHaveBeenCalled();
  });

  it('should allow to navigate backward on no results when there is a past history', () => {
    engine.state.history!.present = getHistoryInitialState();
    engine.state.history!.past = [extractHistory({pipeline: 'test'})];
    initHistoryManager();

    historyManager.backOnNoResults();
    expect(back).toHaveBeenCalled();
  });

  it("won't navigate forward when there is no future history", () => {
    historyManager.forward();
    expect(forward).not.toHaveBeenCalled();
  });

  it('should allow to navigate forward when there is a future history', () => {
    engine.state.history!.present = getHistoryInitialState();
    engine.state.history!.future = [extractHistory({pipeline: 'test'})];
    initHistoryManager();

    historyManager.forward();
    expect(forward).toHaveBeenCalled();
  });
});
