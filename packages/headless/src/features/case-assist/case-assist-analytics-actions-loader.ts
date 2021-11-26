import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByCaseAssistAnalytics} from '../../api/analytics/analytics';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {AsyncThunkAnalyticsOptions} from '../analytics/analytics-utils';
import {
  logAbandonCase,
  logCaseNextStage,
  logCaseStart,
  logClassificationClick,
  logCreateCase,
  logDocumentSuggestionClick,
  logDocumentSuggestionRating,
  logSolveCase,
  logUpdateCaseField,
} from './case-assist-analytics-actions';

export interface CaseAssistAnalyticsActionCreators {
  logCaseStart(): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logCaseNextStage(): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logCreateCase(): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logSolveCase(): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logAbandonCase(): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logUpdateCaseField(
    fieldName: string
  ): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logClassificationClick(
    classificationId: string
  ): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logDocumentSuggestionClick(
    suggestionId: string
  ): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logDocumentSuggestionRating(
    suggestionId: string,
    rating: number
  ): AsyncThunkAction<
    void,
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;
}

export function loadCaseAssistAnalyticsActions(
  _engine: CaseAssistEngine
): CaseAssistAnalyticsActionCreators {
  return {
    logCaseStart,
    logCaseNextStage,
    logCreateCase,
    logSolveCase,
    logAbandonCase,
    logUpdateCaseField,
    logClassificationClick,
    logDocumentSuggestionClick,
    logDocumentSuggestionRating,
  };
}
