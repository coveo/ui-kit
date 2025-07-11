import {buildMockSearch} from '../../test/mock-search.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {logSearchEvent} from '../analytics/analytics-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {
  disableAutomaticQueryCorrection,
  disableDidYouMean,
  enableAutomaticQueryCorrection,
  enableDidYouMean,
  setCorrectionMode,
} from './did-you-mean-actions.js';
import {didYouMeanReducer} from './did-you-mean-slice.js';
import {
  type DidYouMeanState,
  getDidYouMeanInitialState,
} from './did-you-mean-state.js';

describe('did you mean slice', () => {
  let state: DidYouMeanState;
  beforeEach(() => {
    state = getDidYouMeanInitialState();
  });
  it('should not enable did you mean by default', () => {
    expect(didYouMeanReducer(state, {type: ''}).enableDidYouMean).toBe(false);
  });

  it('should handle enable did you mean', () => {
    state.enableDidYouMean = false;
    expect(didYouMeanReducer(state, enableDidYouMean()).enableDidYouMean).toBe(
      true
    );
  });

  it('should handle disable did you mean', () => {
    state.enableDidYouMean = true;
    expect(didYouMeanReducer(state, disableDidYouMean()).enableDidYouMean).toBe(
      false
    );
  });

  it('should clear query corrections on new search', () => {
    state.queryCorrection = {correctedQuery: 'foo', wordCorrections: []};
    expect(
      didYouMeanReducer(state, {type: executeSearch.pending.type})
        .queryCorrection.correctedQuery
    ).toBe('');
  });

  it('should clear automatic corrections on new search', () => {
    state.wasAutomaticallyCorrected = true;
    state.wasCorrectedTo = 'foo';
    const newState = didYouMeanReducer(state, {
      type: executeSearch.pending.type,
    });
    expect(newState.wasAutomaticallyCorrected).toBe(false);
    expect(newState.wasCorrectedTo).toBe('');
  });

  it('should set new query correction on search fulfilled', () => {
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        response: buildMockSearchResponse({
          queryCorrections: [{correctedQuery: 'foo', wordCorrections: []}],
        }),
      }),
      '',
      {legacy: logSearchEvent({evt: 'foo'})}
    );

    expect(
      didYouMeanReducer(state, searchAction).queryCorrection.correctedQuery
    ).toBe('foo');
  });

  it('should set new query correction to empty if none are returned by the API on search fulfilled', () => {
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        response: buildMockSearchResponse({
          queryCorrections: [],
        }),
      }),
      '',
      {legacy: logSearchEvent({evt: 'foo'})}
    );

    expect(
      didYouMeanReducer(state, searchAction).queryCorrection.correctedQuery
    ).toBe('');
  });

  it('should set originalQuery to empty if no corrections are returned by the API on search fulfilled', () => {
    state.originalQuery = 'foo';
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        response: buildMockSearchResponse({
          queryCorrections: [],
        }),
      }),
      '',
      {legacy: logSearchEvent({evt: 'foo'})}
    );

    expect(didYouMeanReducer(state, searchAction).originalQuery).toBe('');
  });

  it('should handle enable autocorrection', () => {
    state.automaticallyCorrectQuery = false;
    expect(
      didYouMeanReducer(state, enableAutomaticQueryCorrection())
        .automaticallyCorrectQuery
    ).toBe(true);
  });

  it('should handle disable autocorrection', () => {
    state.automaticallyCorrectQuery = true;
    expect(
      didYouMeanReducer(state, disableAutomaticQueryCorrection())
        .automaticallyCorrectQuery
    ).toBe(false);
  });

  it('should handle #setCorrectionMode', () => {
    state.queryCorrectionMode = 'legacy';
    expect(
      didYouMeanReducer(state, setCorrectionMode('next')).queryCorrectionMode
    ).toBe('next');
  });

  it('should set corrected query if mode is next', () => {
    state.queryCorrectionMode = 'next';
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        response: buildMockSearchResponse({
          queryCorrection: {
            originalQuery: 'foo',
            correctedQuery: 'bar',
            corrections: [],
          },
        }),
      }),
      '',
      {legacy: logSearchEvent({evt: 'foo'})}
    );
    const resultingState = didYouMeanReducer(state, searchAction);

    expect(resultingState.queryCorrection.correctedQuery).toBe('bar');
    expect(resultingState.wasCorrectedTo).toBe('bar');
  });
});
