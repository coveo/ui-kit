import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice';
import {
  fetchDocumentSuggestions,
  FetchDocumentSuggestionsThunkReturn,
  StateNeededByFetchDocumentSuggestions,
} from './document-suggestion-actions';

/**
 * The document suggestion action creators.
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
 */
export function loadDocumentSuggestionActions(
  engine: CaseAssistEngine
): DocumentSuggestionActionCreators {
  engine.addReducers({documentSuggestion});

  return {
    fetchDocumentSuggestions,
  };
}
