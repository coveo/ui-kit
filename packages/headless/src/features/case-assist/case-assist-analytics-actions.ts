import {makeCaseAssistAnalyticsAction} from '../analytics/analytics-utils';
import {
  selectCase,
  selectCaseClassification,
  selectDocumentSuggestion,
} from './case-assist-analytics-selectors';

export const logCaseStart = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/start',
  (client, state) =>
    client.logEnterInterface({
      ticket: selectCase(state),
    })
);

export const logCaseNextStage = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/nextStage',
  (client, state) =>
    client.logMoveToNextCaseStep({
      ticket: selectCase(state),
    })
);

export const logCreateCase = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/create',
  (client, state) =>
    client.logCaseCreated({
      ticket: selectCase(state),
    })
);

export const logSolveCase = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/solve',
  (client, state) =>
    client.logCaseSolved({
      ticket: selectCase(state),
    })
);

export const logAbandonCase = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/abandon',
  (client, state) =>
    client.logCaseCancelled({
      ticket: selectCase(state),
    })
);

export const logUpdateCaseField = (fieldName: string) =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/case/field/update',
    (client, state) =>
      client.logUpdateCaseField({
        fieldName,
        ticket: selectCase(state),
      })
  )();

export const logClassificationClick = (classificationId: string) =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/classification/click',
    (client, state) =>
      client.logSelectFieldSuggestion({
        suggestion: selectCaseClassification(state, classificationId),
        ticket: selectCase(state),
      })
  )();

export const logDocumentSuggestionClick = (suggestionId: string) =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/documentSuggestion/click',
    (client, state) =>
      client.logSelectDocumentSuggestion({
        suggestion: selectDocumentSuggestion(state, suggestionId),
        ticket: selectCase(state),
      })
  )();

export const logDocumentSuggestionRating = (
  suggestionId: string,
  rating: number
) =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/documentSuggestion/rate',
    (client, state) =>
      client.logRateDocumentSuggestion({
        rating,
        suggestion: selectDocumentSuggestion(state, suggestionId),
        ticket: selectCase(state),
      })
  )();
