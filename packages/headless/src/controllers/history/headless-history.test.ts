import {buildMockEngine} from '../../test/mock-engine';
import {buildHistory} from './headless-history';
import {back, forward} from '../../features/history/history-actions';

describe('history', () => {
  it('should allow to navigate backward', () => {
    const engine = buildMockEngine();
    buildHistory(engine).back();
    expect(engine.actions[0].type).toBe(back.pending.type);
  });

  it('should allow to navigate forward', () => {
    const engine = buildMockEngine();
    buildHistory(engine).forward();
    expect(engine.actions[0].type).toBe(forward.pending.type);
  });
});
