import {configuration} from '../../../app/common-reducers';
import {
  applyDidYouMeanCorrection,
  enableDidYouMean,
} from '../../../features/did-you-mean/did-you-mean-actions';
import {didYouMeanReducer as didYouMean} from '../../../features/did-you-mean/did-you-mean-slice';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../test/mock-engine';
import {buildCoreDidYouMean, DidYouMean} from './headless-core-did-you-mean';

describe('did you mean', () => {
  let dym: DidYouMean;
  let engine: MockSearchEngine;

  function initDidYouMean() {
    dym = buildCoreDidYouMean(engine);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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
