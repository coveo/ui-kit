import {stateKey} from '../../../app/state-key';
import {didYouMeanReducer} from '../../../features/commerce/did-you-mean/did-you-mean-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildDidYouMean, DidYouMean} from './headless-did-you-mean';

describe('did you mean', () => {
  let didYouMean: DidYouMean;
  let engine: MockedCommerceEngine;

  function initDidYouMean() {
    didYouMean = buildDidYouMean(engine);
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    initDidYouMean();
  });

  it('exposes a #subscribe method', () => {
    expect(didYouMean.subscribe).toBeTruthy();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      didYouMean: didYouMeanReducer,
    });
  });

  it('state should reflect correction state', () => {
    engine[stateKey].didYouMean = {
      originalQuery: 'original query',
      wasCorrectedTo: 'corrected query',
      queryCorrection: {
        correctedQuery: 'corrected query',
        wordCorrections: [],
      },
    };

    expect(didYouMean.state).toEqual({
      originalQuery: 'original query',
      wasCorrectedTo: 'corrected query',
      queryCorrection: {
        correctedQuery: 'corrected query',
        wordCorrections: [],
      },
      hasQueryCorrection: true,
      wasAutomaticallyCorrected: true,
    });
  });
});
