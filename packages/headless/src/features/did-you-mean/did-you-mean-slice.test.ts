import {buildMockSearch} from '../../test/mock-search';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {logSearchEvent} from '../analytics/analytics-actions';
import {executeSearch} from '../search/search-actions';
import {
  enableDidYouMean,
  disableDidYouMean,
  disableAutomaticQueryCorrection,
  enableAutomaticQueryCorrection,
  enableQueryCorrection,
  disableQueryCorrection,
} from './did-you-mean-actions';
import {didYouMeanReducer} from './did-you-mean-slice';
import {getDidYouMeanInitialState, DidYouMeanState} from './did-you-mean-state';

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
    expect(didYouMeanReducer(state, enableDidYouMean).enableDidYouMean).toBe(
      true
    );
  });

  it('should handle disable did you mean', () => {
    state.enableDidYouMean = true;
    expect(didYouMeanReducer(state, disableDidYouMean).enableDidYouMean).toBe(
      false
    );
  });

  it('should clear query corrections on new search', () => {
    state.queryCorrection = {correctedQuery: 'foo', wordCorrections: []};
    expect(
      didYouMeanReducer(state, executeSearch.pending).queryCorrection
        .correctedQuery
    ).toBe('');
  });

  it('should clear automatic corrections on new search', () => {
    state.wasAutomaticallyCorrected = true;
    state.wasCorrectedTo = 'foo';
    const newState = didYouMeanReducer(state, executeSearch.pending);
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
      didYouMeanReducer(state, enableAutomaticQueryCorrection)
        .automaticallyCorrectQuery
    ).toBe(true);
  });

  it('should handle disable autocorrection', () => {
    state.automaticallyCorrectQuery = true;
    expect(
      didYouMeanReducer(state, disableAutomaticQueryCorrection)
        .automaticallyCorrectQuery
    ).toBe(false);
  });

  it('should handle #enableFallbackSearchOnEmptyQueryResults', () => {
    state.enableFallbackSearchOnEmptyQueryResults = false;
    expect(
      didYouMeanReducer(state, enableQueryCorrection())
        .enableFallbackSearchOnEmptyQueryResults
    ).toBe(true);
  });

  it('should handle #disableFallbackSearchOnEmptyQueryResults', () => {
    state.enableFallbackSearchOnEmptyQueryResults = true;
    expect(
      didYouMeanReducer(state, disableQueryCorrection())
        .enableFallbackSearchOnEmptyQueryResults
    ).toBe(false);
  });
});
