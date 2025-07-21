import {
  applyDidYouMeanCorrection,
  enableDidYouMean,
} from '../../features/did-you-mean/did-you-mean-actions.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {buildDidYouMean, type DidYouMean} from './headless-did-you-mean.js';

vi.mock('../../features/did-you-mean/did-you-mean-actions');
vi.mock('../../features/search/search-actions');

describe('did you mean', () => {
  let dym: DidYouMean;
  let engine: MockedSearchEngine;

  function initDidYouMean() {
    dym = buildDidYouMean(engine);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    initDidYouMean();
  });

  it('should enable did you mean', () => {
    expect(enableDidYouMean).toHaveBeenCalled();
  });

  it('should allow to update query correction', () => {
    engine.state.didYouMean!.queryCorrection.correctedQuery = 'bar';
    initDidYouMean();

    dym.applyCorrection();
    expect(applyDidYouMeanCorrection).toHaveBeenCalledWith('bar');
  });

  it('dispatches #executeSearch', () => {
    dym.applyCorrection();
    expect(executeSearch).toHaveBeenCalled();
  });
});
