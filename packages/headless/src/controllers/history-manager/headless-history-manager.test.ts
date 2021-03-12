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
import {buildHistoryManager} from './headless-history-manager';

describe('History Manager', () => {
  let engine: MockEngine<SearchAppState>;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it("won't navigate backwards when there is no past history", () => {
    buildHistoryManager(engine).back();
    expect(engine.actions.length).toBe(0);
  });

  it('should allow to navigate backward when there is a past history', () => {
    engine.state.history.present = getHistoryInitialState();
    engine.state.history.past = [extractHistory({pipeline: 'test'})];
    buildHistoryManager(engine).back();
    expect(engine.actions[0].type).toBe(back.pending.type);
    expect(engine.actions[1].type).toBe(undo().type);
  });

  it("won't navigate backwards when there is no future history", () => {
    buildHistoryManager(engine).forward();
    expect(engine.actions.length).toBe(0);
  });

  it('should allow to navigate forward when there is a future history', () => {
    engine.state.history.present = getHistoryInitialState();
    engine.state.history.future = [extractHistory({pipeline: 'test'})];
    buildHistoryManager(engine).forward();
    expect(engine.actions[0].type).toBe(forward.pending.type);
    expect(engine.actions[1].type).toBe(redo().type);
  });
});
