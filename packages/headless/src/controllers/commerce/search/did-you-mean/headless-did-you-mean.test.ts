import {stateKey} from '../../../../app/state-key.js';
import {didYouMeanReducer} from '../../../../features/commerce/did-you-mean/did-you-mean-slice.js';
import {updateQuery} from '../../../../features/commerce/query/query-actions.js';
import {executeSearch} from '../../../../features/commerce/search/search-actions.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildDidYouMean, type DidYouMean} from './headless-did-you-mean.js';

vi.mock('../../../../features/commerce/query/query-actions');
vi.mock('../../../../features/commerce/search/search-actions');

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

  it('initializes', () => {
    expect(didYouMean).toBeTruthy();
  });

  it('exposes a #subscribe method', () => {
    expect(didYouMean.subscribe).toBeTruthy();
  });

  it('adds the correct reducer to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      didYouMean: didYouMeanReducer,
    });
  });

  describe('#state', () => {
    it('#originalQuery reflects originalQuery from engine state', () => {
      engine[stateKey].didYouMean = {
        originalQuery: 'original query',
        wasCorrectedTo: '',
        queryCorrection: {
          correctedQuery: '',
          wordCorrections: [],
        },
      };

      expect(didYouMean.state.originalQuery).toEqual('original query');
    });

    it('#wasCorrectedTo reflects wasCorrectedTo from engine state', () => {
      engine[stateKey].didYouMean = {
        originalQuery: '',
        wasCorrectedTo: 'corrected query',
        queryCorrection: {
          correctedQuery: '',
          wordCorrections: [],
        },
      };

      expect(didYouMean.state.wasCorrectedTo).toEqual('corrected query');
    });

    it('#queryCorrection reflects queryCorrection from engine state', () => {
      engine[stateKey].didYouMean = {
        originalQuery: '',
        wasCorrectedTo: '',
        queryCorrection: {
          correctedQuery: 'correctedQuery',
          wordCorrections: [
            {correctedWord: 'abc', originalWord: 'abd', length: 3, offset: 2},
          ],
        },
      };

      expect(didYouMean.state.queryCorrection).toEqual({
        correctedQuery: 'correctedQuery',
        wordCorrections: [
          {correctedWord: 'abc', originalWord: 'abd', length: 3, offset: 2},
        ],
      });
    });

    it('#hasQueryCorrection is true if queryCorrection.correctedQuery is not an empty string and wasCorrectedTo is an empty string in the engine state', () => {
      engine[stateKey].didYouMean = {
        originalQuery: '',
        wasCorrectedTo: '',
        queryCorrection: {
          correctedQuery: 'correctedQuery',
          wordCorrections: [],
        },
      };

      expect(didYouMean.state.hasQueryCorrection).toEqual(true);
    });

    it('#hasQueryCorrection is true if queryCorrection.correctedQuery is an empty string and wasCorrectedTo is not an empty string in the engine state', () => {
      engine[stateKey].didYouMean = {
        originalQuery: '',
        wasCorrectedTo: '',
        queryCorrection: {
          correctedQuery: 'correctedQuery',
          wordCorrections: [],
        },
      };

      expect(didYouMean.state.hasQueryCorrection).toEqual(true);
    });

    it('#hasQueryCorrection is false if both queryCorrection.correctedQuery and wasCorrectedTo are empty strings in the engine state', () => {
      engine[stateKey].didYouMean = {
        originalQuery: '',
        wasCorrectedTo: '',
        queryCorrection: {
          correctedQuery: '',
          wordCorrections: [],
        },
      };

      expect(didYouMean.state.hasQueryCorrection).toEqual(false);
    });

    it('#wasAutomaticallyCorrected is true if wasCorrectedTo is not an empty string in the state', () => {
      engine[stateKey].didYouMean = {
        originalQuery: '',
        wasCorrectedTo: 'corrected query',
        queryCorrection: {
          correctedQuery: '',
          wordCorrections: [],
        },
      };

      expect(didYouMean.state.wasAutomaticallyCorrected).toEqual(true);
    });

    it('#wasAutomaticallyCorrected is false if wasCorrectedTo is an empty string in the state', () => {
      engine[stateKey].didYouMean = {
        originalQuery: '',
        wasCorrectedTo: '',
        queryCorrection: {
          correctedQuery: '',
          wordCorrections: [],
        },
      };

      expect(didYouMean.state.wasAutomaticallyCorrected).toEqual(false);
    });
  });

  describe('#applyCorrection', () => {
    it('dispatches updateQuery with the corrected query', () => {
      engine[stateKey].didYouMean = {
        originalQuery: '',
        wasCorrectedTo: '',
        queryCorrection: {
          correctedQuery: 'corrected query',
          wordCorrections: [],
        },
      };

      didYouMean.applyCorrection();

      expect(updateQuery).toHaveBeenCalledWith({query: 'corrected query'});
    });

    it('dispatches executeSearch', () => {
      engine[stateKey].didYouMean = {
        originalQuery: '',
        wasCorrectedTo: '',
        queryCorrection: {
          correctedQuery: 'corrected query',
          wordCorrections: [],
        },
      };

      didYouMean.applyCorrection();

      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
