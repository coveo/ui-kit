import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {documentSuggestions} from '../../app/reducers';
import {
  fetchDocumentSuggestions,
  FetchDocumentSuggestionsThunkReturn,
  StateNeededByFetchDocumentSuggestions,
} from './document-suggestions-actions';

/**
 * The case fields action creators.
 */
export interface CaseAssistActionCreators {
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
 * Loads the `document suggestions` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadDocumentSuggestionsActions(
  engine: CaseAssistEngine
): CaseAssistActionCreators {
  engine.addReducers({documentSuggestions});

  return {
    fetchDocumentSuggestions,
  };
}
