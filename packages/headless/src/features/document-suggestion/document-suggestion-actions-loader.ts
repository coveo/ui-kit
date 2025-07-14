import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client.js';
import type {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import {
  type FetchDocumentSuggestionsThunkReturn,
  fetchDocumentSuggestions,
  type StateNeededByFetchDocumentSuggestions,
} from './document-suggestion-actions.js';

/**
 * The document suggestion action creators.
 *
 * @group Actions
 * @category DocumentSuggestion
 */
export interface DocumentSuggestionActionCreators {
  /**
   * Retrieves the document suggestions from the platform.
   * Document suggestions are retrieved based on the case information entered so far.
   *
   * @returns A dispatchable action.
   */
  fetchDocumentSuggestions(): AsyncThunkAction<
    FetchDocumentSuggestionsThunkReturn,
    void,
    AsyncThunkCaseAssistOptions<StateNeededByFetchDocumentSuggestions>
  >;
}

/**
 * Loads the `document suggestion` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category DocumentSuggestion
 */
export function loadDocumentSuggestionActions(
  engine: CaseAssistEngine
): DocumentSuggestionActionCreators {
  engine.addReducers({documentSuggestion});

  return {
    fetchDocumentSuggestions,
  };
}
