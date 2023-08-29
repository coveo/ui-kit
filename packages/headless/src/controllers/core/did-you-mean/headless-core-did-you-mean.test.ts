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
import {
  buildCoreDidYouMean,
  DidYouMean,
  DidYouMeanProps,
} from './headless-core-did-you-mean';

describe('did you mean', () => {
  let dym: DidYouMean;
  let engine: MockSearchEngine;

  function initDidYouMean(props: DidYouMeanProps = {}) {
    dym = buildCoreDidYouMean(engine, props);
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

  it('should allow to update query correction when automatic correction is disabled', () => {
    engine.state.didYouMean.queryCorrection.correctedQuery = 'bar';
    initDidYouMean({automaticallyCorrectQuery: true});

    dym.applyCorrection();
    expect(engine.actions).toContainEqual(applyDidYouMeanCorrection('bar'));
  });
});
