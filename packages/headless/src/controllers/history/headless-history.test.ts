import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {buildHistory} from './headless-history';
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

describe('history', () => {
  let engine: MockEngine<SearchAppState>;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it("won't navigate backwards when there is no past history", () => {
    buildHistory(engine).back();
    expect(engine.actions.length).toBe(0);
  });

  it('should allow to navigate backward when there is a past history', () => {
    engine.state.history.present = getHistoryInitialState();
    engine.state.history.past = [extractHistory({pipeline: 'test'})];
    buildHistory(engine).back();
    expect(engine.actions[0].type).toBe(back.pending.type);
    expect(engine.actions[1].type).toBe(undo().type);
  });

  it("won't navigate backwards when there is no future history", () => {
    buildHistory(engine).forward();
    expect(engine.actions.length).toBe(0);
  });

  it('should allow to navigate forward when there is a future history', () => {
    engine.state.history.present = getHistoryInitialState();
    engine.state.history.future = [extractHistory({pipeline: 'test'})];
    buildHistory(engine).forward();
    expect(engine.actions[0].type).toBe(forward.pending.type);
    expect(engine.actions[1].type).toBe(redo().type);
  });
});
