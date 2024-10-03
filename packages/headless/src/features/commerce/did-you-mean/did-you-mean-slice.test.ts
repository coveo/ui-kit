import {buildSearchResponse} from '../../../test/mock-commerce-search.js';
import {executeSearch} from '../search/search-actions.js';
import {didYouMeanReducer} from './did-you-mean-slice.js';
import {
  getDidYouMeanInitialState,
  DidYouMeanState,
} from './did-you-mean-state.js';

describe('did you mean slice', () => {
  let state: DidYouMeanState;
  beforeEach(() => {
    state = getDidYouMeanInitialState();
  });

  it('should clear query corrections on new search', () => {
    state.queryCorrection = {correctedQuery: 'foo', wordCorrections: []};
    expect(
      didYouMeanReducer(state, {type: executeSearch.pending.type})
        .queryCorrection.correctedQuery
    ).toBe('');
  });

  it('should clear automatic corrections on new search', () => {
    state.wasCorrectedTo = 'foo';
    const newState = didYouMeanReducer(state, {
      type: executeSearch.pending.type,
    });
    expect(newState.wasCorrectedTo).toBe('');
  });

  it('should set new query correction on search fulfilled', () => {
    const searchAction = executeSearch.fulfilled(
      buildSearchResponse({
        queryCorrection: {
          correctedQuery: 'foo',
          originalQuery: 'pho',
          corrections: [],
        },
      }),
      ''
    );

    expect(
      didYouMeanReducer(state, searchAction).queryCorrection.correctedQuery
    ).toBe('foo');
  });

  it('should set new query correction to empty if none are returned by the API on search fulfilled', () => {
    const searchAction = executeSearch.fulfilled(
      buildSearchResponse({
        queryCorrection: undefined,
      }),
      ''
    );

    expect(
      didYouMeanReducer(state, searchAction).queryCorrection.correctedQuery
    ).toBe('');
  });

  it('should set originalQuery to empty if no corrections are returned by the API on search fulfilled', () => {
    state.originalQuery = 'foo';
    const searchAction = executeSearch.fulfilled(
      buildSearchResponse({
        queryCorrection: undefined,
      }),
      ''
    );

    expect(didYouMeanReducer(state, searchAction).originalQuery).toBe('');
  });
});
