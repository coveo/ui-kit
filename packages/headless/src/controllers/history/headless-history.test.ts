import {buildMockSearchAppEngine} from '../../test/mock-engine';
import {buildHistory} from './headless-history';
import {back, forward} from '../../features/history/history-actions';
import {ActionCreators} from '../../app/undoable';

describe('history', () => {
  it('should allow to navigate backward', () => {
    const engine = buildMockSearchAppEngine();
    buildHistory(engine).back();
    expect(engine.actions[0].type).toBe(back.pending.type);
    expect(engine.actions[1].type).toBe(ActionCreators.undo().type);
  });

  it('should allow to navigate forward', () => {
    const engine = buildMockSearchAppEngine();
    buildHistory(engine).forward();
    expect(engine.actions[0].type).toBe(forward.pending.type);
    expect(engine.actions[1].type).toBe(ActionCreators.redo().type);
  });
});
