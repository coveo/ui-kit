import {FieldSuggestionsFacet} from '../../../../api/commerce/search/query-suggest/query-suggest-response';

export type {FieldSuggestionsFacet};
export type FieldSuggestionsOrderState = FieldSuggestionsFacet[];

export function getFieldSuggestionsOrderInitialState(): FieldSuggestionsOrderState {
  return [];
}
