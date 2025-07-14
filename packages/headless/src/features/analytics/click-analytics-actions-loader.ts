import type {Result} from '../../api/search/search/result.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  logOpenSmartSnippetInlineLink,
  logOpenSmartSnippetSource,
  logOpenSmartSnippetSuggestionInlineLink,
  logOpenSmartSnippetSuggestionSource,
} from '../question-answering/question-answering-analytics-actions.js';
import type {
  QuestionAnsweringInlineLinkActionCreatorPayload,
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
} from '../question-answering/question-answering-document-id.js';
import {logDocumentOpen} from '../result/result-analytics-actions.js';
import type {ClickAction} from './analytics-utils.js';

/**
 * The click analytics action creators.
 *
 * @group Actions
 * @category Analytics
 */
export interface ClickAnalyticsActionCreators {
  /**
   * The event to log when a result is selected.
   *
   * @param result - The selected result.
   * @returns A dispatchable action.
   */
  logDocumentOpen(result: Result): ClickAction;
  /**
   * The event to log when the source of a smart snippet is clicked.
   *
   * @returns A dispatchable action.
   */
  logOpenSmartSnippetSource(): ClickAction;
  /**
   * The event to log when the source of a smart snippet suggestion, or related question, is clicked.
   *
   * @param identifier - The identifier of the suggestion.
   * @returns A dispatchable action.
   */
  logOpenSmartSnippetSuggestionSource(
    identifier: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): ClickAction;
  /**
   * The event to log when a link inside the snippet of a smart snippet is clicked.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logOpenSmartSnippetInlineLink(
    payload: QuestionAnsweringInlineLinkActionCreatorPayload
  ): ClickAction;
  /**
   * The event to log when the source of a smart snippet suggestion, or related question, is clicked.
   *
   * @param identifier - The identifier of the suggestion.
   * @param link - The link that was opened.
   * @returns A dispatchable action.
   */
  logOpenSmartSnippetSuggestionInlineLink(
    identifier: QuestionAnsweringUniqueIdentifierActionCreatorPayload,
    link: QuestionAnsweringInlineLinkActionCreatorPayload
  ): ClickAction;
}

/**
 * Returns possible click analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category Analytics
 */
export function loadClickAnalyticsActions(
  engine: SearchEngine
): ClickAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logDocumentOpen,
    logOpenSmartSnippetSource,
    logOpenSmartSnippetSuggestionSource,
    logOpenSmartSnippetInlineLink,
    logOpenSmartSnippetSuggestionInlineLink,
  };
}
