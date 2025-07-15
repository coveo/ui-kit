import type {CaseAssist} from '@coveo/relay-event-types';
import {
  type CaseAssistAction,
  makeCaseAssistAnalyticsAction,
} from '../analytics/analytics-utils.js';
import type {NextStageOptions} from './case-assist-analytics-actions-loader.js';
import {
  caseAssistCaseClassificationSelector,
  caseAssistCaseSelector,
  caseAssistDocumentSuggestionSelector,
} from './case-assist-analytics-selectors.js';

export const logCaseStart = (): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/case/start',
    __legacy__getBuilder: (client, state) => {
      return client.logEnterInterface({
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.Start',
    analyticsPayloadBuilder: (): CaseAssist.Start => ({}),
  });

//TODO: SFINT-5435
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
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/case/create',
    __legacy__getBuilder: (client, state) => {
      return client.logCaseCreated({
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.CreateTicket',
    analyticsPayloadBuilder: (state): CaseAssist.CreateTicket => {
      const {id, category, subject, description, productId} =
        caseAssistCaseSelector(state);
      return {
        ticket: {
          id: id!,
          category,
          subject,
          description,
          system: productId,
        },
      };
    },
  });

export const logSolveCase = (): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/case/solve',
    __legacy__getBuilder: (client, state) => {
      return client.logCaseSolved({
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.Cancel',
    analyticsPayloadBuilder: (): CaseAssist.Cancel => ({
      reason: 'solved',
    }),
  });

export const logAbandonCase = (): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/case/abandon',
    __legacy__getBuilder: (client, state) => {
      return client.logCaseCancelled({
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.Cancel',
    analyticsPayloadBuilder: (): CaseAssist.Cancel => ({
      reason: 'quit',
    }),
  });

export const logUpdateCaseField = (fieldName: string): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/case/field/update',
    __legacy__getBuilder: (client, state) => {
      return client.logUpdateCaseField({
        fieldName,
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.UpdateField',
    analyticsPayloadBuilder: (state): CaseAssist.UpdateField => {
      const fieldValue =
        state.caseField?.fields?.[fieldName]?.value ||
        state.caseInput?.[fieldName]?.value ||
        '';
      return {
        fieldName,
        fieldValue,
      };
    },
  });

export const logAutoSelectCaseField = (
  classificationId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/classification/click',
    __legacy__getBuilder: (client, state) => {
      return client.logSelectFieldSuggestion({
        suggestion: caseAssistCaseClassificationSelector(
          state,
          classificationId,
          true
        ),
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.SelectFieldClassification',
    analyticsPayloadBuilder: (
      state
    ): CaseAssist.SelectFieldClassification | undefined => {
      const responseId = state.caseField?.status?.lastResponseId;
      if (responseId) {
        return {
          autoselected: true,
          classificationId,
          responseId,
        };
      }
    },
  });

export const logClassificationClick = (
  classificationId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/classification/click',
    __legacy__getBuilder: (client, state) => {
      return client.logSelectFieldSuggestion({
        suggestion: caseAssistCaseClassificationSelector(
          state,
          classificationId
        ),
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.SelectFieldClassification',
    analyticsPayloadBuilder: (
      state
    ): CaseAssist.SelectFieldClassification | undefined => {
      const responseId = state.caseField?.status?.lastResponseId;
      if (responseId) {
        return {
          autoselected: false,
          classificationId,
          responseId,
        };
      }
    },
  });

export const logDocumentSuggestionClick = (
  suggestionId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/documentSuggestion/click',
    __legacy__getBuilder: (client, state) => {
      return client.logSelectDocumentSuggestion({
        suggestion: caseAssistDocumentSuggestionSelector(state, suggestionId),
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.DocumentSuggestionClick',
    analyticsPayloadBuilder: (
      state
    ): CaseAssist.DocumentSuggestionClick | undefined => {
      const responseId = state.documentSuggestion?.status?.lastResponseId;
      const documentSuggestion = caseAssistDocumentSuggestionSelector(
        state,
        suggestionId
      );
      if (responseId) {
        return {
          responseId,
          position: documentSuggestion.suggestion.documentPosition,
          itemMetadata: {
            uniqueFieldName: 'uniqueId',
            uniqueFieldValue: documentSuggestion.suggestionId,
            url: documentSuggestion.suggestion.documentUri,
            title: documentSuggestion.suggestion.documentTitle,
          },
        };
      }
    },
  });

export const logQuickviewDocumentSuggestionClick = (
  suggestionId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/documentSuggestion/click',
    __legacy__getBuilder: (client, state) => {
      return client.logQuickviewDocumentSuggestion({
        suggestion: caseAssistDocumentSuggestionSelector(state, suggestionId),
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.DocumentSuggestionClick',
    analyticsPayloadBuilder: (
      state
    ): CaseAssist.DocumentSuggestionClick | undefined => {
      const responseId = state.documentSuggestion?.status?.lastResponseId;
      const documentSuggestion = caseAssistDocumentSuggestionSelector(
        state,
        suggestionId
      );
      if (responseId) {
        return {
          responseId,
          position: documentSuggestion.suggestion.documentPosition,
          itemMetadata: {
            uniqueFieldName: 'uniqueId',
            uniqueFieldValue: documentSuggestion.suggestionId,
            url: documentSuggestion.suggestion.documentUri,
            title: documentSuggestion.suggestion.documentTitle,
          },
        };
      }
    },
  });

export const logDocumentSuggestionOpen = (
  suggestionId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/documentSuggestion/click',
    __legacy__getBuilder: (client, state) => {
      return client.logSelectDocumentSuggestion({
        suggestion: caseAssistDocumentSuggestionSelector(
          state,
          suggestionId,
          false,
          true
        ),
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.DocumentSuggestionClick',
    analyticsPayloadBuilder: (
      state
    ): CaseAssist.DocumentSuggestionClick | undefined => {
      const responseId = state.documentSuggestion?.status?.lastResponseId;
      const documentSuggestion = caseAssistDocumentSuggestionSelector(
        state,
        suggestionId
      );
      if (responseId) {
        return {
          responseId,
          position: documentSuggestion.suggestion.documentPosition,
          itemMetadata: {
            uniqueFieldName: 'uniqueId',
            uniqueFieldValue: documentSuggestion.suggestionId,
            url: documentSuggestion.suggestion.documentUri,
            title: documentSuggestion.suggestion.documentTitle,
          },
        };
      }
    },
  });

//TODO: SFINT-5471
export const logDocumentSuggestionRating = (
  suggestionId: string,
  rating: number
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/documentSuggestion/rate',
    __legacy__getBuilder: (client, state) => {
      return client.logRateDocumentSuggestion({
        rating,
        suggestion: caseAssistDocumentSuggestionSelector(state, suggestionId),
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'CaseAssist.DocumentSuggestionFeedback',
    analyticsPayloadBuilder: (
      state
    ): CaseAssist.DocumentSuggestionFeedback | undefined => {
      const responseId = state.documentSuggestion?.status?.lastResponseId;
      const documentSuggestion = caseAssistDocumentSuggestionSelector(
        state,
        suggestionId
      );
      if (responseId) {
        return {
          responseId,
          itemMetadata: {
            uniqueFieldName: 'uniqueId',
            uniqueFieldValue: documentSuggestion.suggestionId,
            url: documentSuggestion.suggestion.documentUri,
            title: documentSuggestion.suggestion.documentTitle,
          },
          liked: !!rating,
        };
      }
    },
  });
