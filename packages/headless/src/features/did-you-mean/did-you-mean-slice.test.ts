import {didYouMeanReducer} from './did-you-mean-slice';
import {enableDidYouMean, disableDidYouMean} from './did-you-mean-actions';
import {executeSearch} from '../search/search-actions';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearch} from '../../test/mock-search';
import {logGenericSearchEvent} from '../analytics/analytics-actions';
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
      logGenericSearchEvent({evt: 'foo'})
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
      logGenericSearchEvent({evt: 'foo'})
    );

    expect(
      didYouMeanReducer(state, searchAction).queryCorrection.correctedQuery
    ).toBe('');
  });
});
