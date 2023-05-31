import {
  CaseAssistAction,
  makeCaseAssistAnalyticsAction,
} from '../analytics/analytics-utils';
import {NextStageOptions} from './case-assist-analytics-actions-loader';
import {
  caseAssistCaseSelector,
  caseAssistCaseClassificationSelector,
  caseAssistDocumentSuggestionSelector,
} from './case-assist-analytics-selectors';

export const logCaseStart = (): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/case/start',
    (client, state) =>
      client.logEnterInterface({
        ticket: caseAssistCaseSelector(state),
      })
  );

export const logCaseNextStage = (
  options?: NextStageOptions
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/case/nextStage',
    (client, state) =>
      client.logMoveToNextCaseStep({
        ticket: caseAssistCaseSelector(state),
        stage: options?.stageName,
      })
  );

export const logCreateCase = (): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/case/create',
    (client, state) =>
      client.logCaseCreated({
        ticket: caseAssistCaseSelector(state),
      })
  );

export const logSolveCase = (): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/case/solve',
    (client, state) =>
      client.logCaseSolved({
        ticket: caseAssistCaseSelector(state),
      })
  );

export const logAbandonCase = (): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/case/abandon',
    (client, state) =>
      client.logCaseCancelled({
        ticket: caseAssistCaseSelector(state),
      })
  );

export const logUpdateCaseField = (fieldName: string): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/case/field/update',
    (client, state) =>
      client.logUpdateCaseField({
        fieldName,
        ticket: caseAssistCaseSelector(state),
      })
  );

export const logAutoSelectCaseField = (
  classificationId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/classification/click',
    (client, state) =>
      client.logSelectFieldSuggestion({
        suggestion: caseAssistCaseClassificationSelector(
          state,
          classificationId,
          true
        ),
        ticket: caseAssistCaseSelector(state),
      })
  );

export const logClassificationClick = (
  classificationId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/classification/click',
    (client, state) =>
      client.logSelectFieldSuggestion({
        suggestion: caseAssistCaseClassificationSelector(
          state,
          classificationId
        ),
        ticket: caseAssistCaseSelector(state),
      })
  );

export const logDocumentSuggestionClick = (
  suggestionId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/documentSuggestion/click',
    (client, state) =>
      client.logSelectDocumentSuggestion({
        suggestion: caseAssistDocumentSuggestionSelector(state, suggestionId),
        ticket: caseAssistCaseSelector(state),
      })
  );

export const logQuickviewDocumentSuggestionClick = (
  suggestionId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/documentSuggestion/click',
    (client, state) =>
      client.logSelectDocumentSuggestion({
        suggestion: caseAssistDocumentSuggestionSelector(
          state,
          suggestionId,
          true
        ),
        ticket: caseAssistCaseSelector(state),
      })
  );

export const logDocumentSuggestionOpen = (
  suggestionId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/documentSuggestion/click',
    (client, state) =>
      client.logSelectDocumentSuggestion({
        suggestion: caseAssistDocumentSuggestionSelector(
          state,
          suggestionId,
          false,
          true
        ),
        ticket: caseAssistCaseSelector(state),
      })
  );

export const logDocumentSuggestionRating = (
  suggestionId: string,
  rating: number
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/documentSuggestion/rate',
    (client, state) =>
      client.logRateDocumentSuggestion({
        rating,
        suggestion: caseAssistDocumentSuggestionSelector(state, suggestionId),
        ticket: caseAssistCaseSelector(state),
      })
  );
