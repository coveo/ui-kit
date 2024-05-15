import {AnyAction} from '@reduxjs/toolkit';
import {fetchQuerySuggestions} from '../../query-suggest/query-suggest-actions';
import {fieldSuggestionsOrderReducer} from './field-suggestions-order-slice';
import {
  FieldSuggestionsFacet,
  FieldSuggestionsOrderState,
  getFieldSuggestionsOrderInitialState,
} from './field-suggestions-order-state';

describe('field suggestions order slice', () => {
  let state: FieldSuggestionsOrderState;

  function dispatchMock(action: AnyAction) {
    state = fieldSuggestionsOrderReducer(state, action);
  }

  beforeEach(() => {
    state = getFieldSuggestionsOrderInitialState();
  });

  it('initializes the state correctly', () => {
    expect(fieldSuggestionsOrderReducer(undefined, {type: ''})).toEqual([]);
  });

  function buildQueryAction(facets: FieldSuggestionsFacet[]) {
    return fetchQuerySuggestions.fulfilled(
      {
        completions: [],
        id: '',
        responseId: 'responseId',
        query: 'abc',
        fieldSuggestionsFacets: facets,
      },
      '',
      {id: 'id'}
    );
  }
  it('saves the facet order when a query is successful', () => {
    const facets: FieldSuggestionsFacet[] = [
      {
        facetId: 'facetA',
        type: 'regular',
      },
      {
        facetId: 'facetB',
        type: 'hierarchical',
      },
    ];
    dispatchMock(buildQueryAction(facets));
    expect(state).toEqual(facets);
  });
});
