import {makeCaseAssistAnalyticsAction} from '../analytics/analytics-utils';
import {
  caseAssistCaseSelector,
  caseAssistCaseClassificationSelector,
  caseAssistDocumentSuggestionSelector,
} from './case-assist-analytics-selectors';

export const logCaseStart = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/start',
  (client, state) =>
    client.logEnterInterface({
      ticket: caseAssistCaseSelector(state),
    })
);

export const logCaseNextStage = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/nextStage',
  (client, state) =>
    client.logMoveToNextCaseStep({
      ticket: caseAssistCaseSelector(state),
    })
);

export const logCreateCase = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/create',
  (client, state) =>
    client.logCaseCreated({
      ticket: caseAssistCaseSelector(state),
    })
);

export const logSolveCase = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/solve',
  (client, state) =>
    client.logCaseSolved({
      ticket: caseAssistCaseSelector(state),
    })
);

export const logAbandonCase = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/abandon',
  (client, state) =>
    client.logCaseCancelled({
      ticket: caseAssistCaseSelector(state),
    })
);

export const logUpdateCaseField = (fieldName: string) =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/case/field/update',
    (client, state) =>
      client.logUpdateCaseField({
        fieldName,
        ticket: caseAssistCaseSelector(state),
      })
  )();

export const logClassificationClick = (classificationId: string) =>
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
  )();

export const logDocumentSuggestionClick = (suggestionId: string) =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/documentSuggestion/click',
    (client, state) =>
      client.logSelectDocumentSuggestion({
        suggestion: caseAssistDocumentSuggestionSelector(state, suggestionId),
        ticket: caseAssistCaseSelector(state),
      })
  )();

export const logQuickviewDocumentSuggestionClick = (suggestionId: string) => {
  return buildQuickviewDocumentSuggestionClickThunk(suggestionId)();
};

export const buildQuickviewDocumentSuggestionClickThunk = (
  suggestionId: string
) => {
  return makeCaseAssistAnalyticsAction(
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
};

export const logDocumentSuggestionRating = (
  suggestionId: string,
  rating: number
) =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/documentSuggestion/rate',
    (client, state) =>
      client.logRateDocumentSuggestion({
        rating,
        suggestion: caseAssistDocumentSuggestionSelector(state, suggestionId),
        ticket: caseAssistCaseSelector(state),
      })
  )();
