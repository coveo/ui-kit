import {
  applyDidYouMeanCorrection,
  enableDidYouMean,
} from '../../../features/did-you-mean/did-you-mean-actions.js';
import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {
  buildDidYouMean,
  type DidYouMean,
} from './headless-insight-did-you-mean.js';

vi.mock('../../../features/insight-search/insight-search-actions');
vi.mock('../../../features/did-you-mean/did-you-mean-actions');

describe('did you mean', () => {
  let dym: DidYouMean;
  let engine: MockedInsightEngine;

  function initDidYouMean() {
    dym = buildDidYouMean(engine);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine(buildMockInsightState());
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
