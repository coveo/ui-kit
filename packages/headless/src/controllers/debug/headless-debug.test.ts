import {disableDebug, enableDebug} from '../../features/debug/debug-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {buildDebug, Debug} from './headless-debug';

describe('Debug', () => {
  let engine: MockEngine<SearchAppState>;
  let debug: Debug;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    debug = buildDebug(engine);
  });

  it('initializes', () => {
    expect(debug).toBeTruthy();
  });

  it('enable dispatches a enableDebug action', () => {
    debug.enable();

    expect(
      engine.actions.find((a) => a.type === enableDebug.type)
    ).toBeDefined();
  });

  it('disable dispatches a disableDebug action', () => {
    debug.disable();

    expect(
      engine.actions.find((a) => a.type === disableDebug.type)
    ).toBeDefined();
  });
});
