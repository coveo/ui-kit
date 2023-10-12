import {
  applyDidYouMeanCorrection,
  enableDidYouMean,
} from '../../features/did-you-mean/did-you-mean-actions.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine.js';
import {buildDidYouMean, DidYouMean} from './headless-did-you-mean.js';

describe('did you mean', () => {
  let dym: DidYouMean;
  let engine: MockSearchEngine;

  function initDidYouMean() {
    dym = buildDidYouMean(engine);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initDidYouMean();
  });

  it('should enable did you mean', () => {
    expect(engine.actions).toContainEqual(enableDidYouMean());
  });

  it('should allow to update query correction', () => {
    engine.state.didYouMean.queryCorrection.correctedQuery = 'bar';
    initDidYouMean();

    dym.applyCorrection();
    expect(engine.actions).toContainEqual(applyDidYouMeanCorrection('bar'));
  });

  it('dispatches #executeSearch', () => {
    dym.applyCorrection();
    const action = engine.findAsyncAction(executeSearch.pending);
    expect(action).toBeTruthy();
  });
});
