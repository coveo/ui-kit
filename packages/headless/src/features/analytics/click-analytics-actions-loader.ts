import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededBySearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {Result} from '../../api/search/search/result';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  logOpenSmartSnippetInlineLink,
  logOpenSmartSnippetSource,
  logOpenSmartSnippetSuggestionInlineLink,
  logOpenSmartSnippetSuggestionSource,
} from '../question-answering/question-answering-analytics-actions';
import {
  QuestionAnsweringInlineLinkActionCreatorPayload,
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
} from '../question-answering/question-answering-document-id';
import {logDocumentOpen} from '../result/result-analytics-actions';
import {AnalyticsType, AsyncThunkAnalyticsOptions} from './analytics-utils';

/**
 * The click analytics action creators.
 */
export interface ClickAnalyticsActionCreators {
  /**
   * The event to log when a result is selected.
   *
   * @param result - The selected result.
   * @returns A dispatchable action.
   */
  logDocumentOpen(result: Result): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;
  /**
   * The event to log when the source of a smart snippet is clicked.
   *
   * @param source - The source of the clicked smart snippet.
   * @returns A dispatchable action.
   * @deprecated Providing a source is no longer necessary.
   */
  logOpenSmartSnippetSource(source: Result): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;
  /**
   * The event to log when the source of a smart snippet is clicked.
   *
   * @returns A dispatchable action.
   */
  logOpenSmartSnippetSource(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;
  /**
   * The event to log when the source of a smart snippet suggestion, or related question, is clicked.
   *
   * @param identifier - The identifier of the suggestion.
   * @returns A dispatchable action.
   */
  logOpenSmartSnippetSuggestionSource(
    identifier: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;
  /**
   * The event to log when a link inside the snippet of a smart snippet is clicked.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logOpenSmartSnippetInlineLink(
    payload: QuestionAnsweringInlineLinkActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;
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
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;
}

/**
 * Returns possible click analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
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
