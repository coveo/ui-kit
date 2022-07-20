import {buildDidYouMean, DidYouMean} from './headless-insight-did-you-mean';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {
  applyDidYouMeanCorrection,
  enableDidYouMean,
} from '../../../features/did-you-mean/did-you-mean-actions';
import {configuration, didYouMean} from '../../../app/reducers';

describe('did you mean', () => {
  let dym: DidYouMean;
  let engine: MockInsightEngine;

  function initDidYouMean() {
    dym = buildDidYouMean(engine);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine();
    initDidYouMean();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      didYouMean,
    });
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
});
