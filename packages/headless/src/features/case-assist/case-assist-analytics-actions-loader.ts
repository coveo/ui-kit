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
    {},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logCaseNextStage(): AsyncThunkAction<
    {},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logCreateCase(): AsyncThunkAction<
    {},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logSolveCase(): AsyncThunkAction<
    {},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logAbandonCase(): AsyncThunkAction<
    {},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logUpdateCaseField(
    fieldName: string
  ): AsyncThunkAction<
    {},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logClassificationClick(
    classificationId: string
  ): AsyncThunkAction<
    {},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logDocumentSuggestionClick(
    suggestionId: string
  ): AsyncThunkAction<
    {},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;

  logDocumentSuggestionRating(
    suggestionId: string,
    rating: number
  ): AsyncThunkAction<
    {},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByCaseAssistAnalytics>
  >;
}

export function loadCaseAssistAnalyticsActions(
  engine: CaseAssistEngine
): CaseAssistAnalyticsActionCreators {
  engine.addReducers({});

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
