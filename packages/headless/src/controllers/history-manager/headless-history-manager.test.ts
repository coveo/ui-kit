import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {
  back,
  forward,
  redo,
  undo,
} from '../../features/history/history-actions';
import {
  extractHistory,
  getHistoryInitialState,
} from '../../features/history/history-state';
import {SearchAppState} from '../../state/search-app-state';
import {buildHistoryManager, HistoryManager} from './headless-history-manager';
import {configuration, history} from '../../app/reducers';

describe('History Manager', () => {
  let engine: MockEngine<SearchAppState>;
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
    });
  });

  it("won't navigate backwards when there is no past history", () => {
    historyManager.back();
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
