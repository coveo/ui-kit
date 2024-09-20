import {CaseAssist, ItemClick} from '@coveo/relay-event-types';
import {
  CaseAssistAction,
  makeCaseAssistAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {NextStageOptions} from './case-assist-analytics-actions-loader.js';
import {
  caseAssistCaseSelector,
  caseAssistCaseClassificationSelector,
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
    analyticsType: 'caseAssist.start',
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
    analyticsType: 'caseAssist.createTicket',
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
    analyticsType: 'caseAssist.cancel',
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
    analyticsType: 'caseAssist.cancel',
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
    analyticsType: 'caseAssist.updateField',
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
    analyticsType: 'caseAssist.selectFieldClassification',
    analyticsPayloadBuilder: (state): CaseAssist.SelectFieldClassification => {
      return {
        autoselected: true,
        fieldClassification: {
          id: classificationId,
          responseId: state.caseField?.status?.lastResponseId || '',
        },
      };
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
    analyticsType: 'caseAssist.selectFieldClassification',
    analyticsPayloadBuilder: (state): CaseAssist.SelectFieldClassification => {
      return {
        autoselected: false,
        fieldClassification: {
          id: classificationId,
          responseId: state.caseField?.status?.lastResponseId || '',
        },
      };
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
    analyticsType: 'caseAssist.documentSuggestionClick',
    analyticsPayloadBuilder: (state): CaseAssist.DocumentSuggestionClick => {
      return {
        documentSuggestion: {
          id: suggestionId,
          responseId: state.documentSuggestion?.status?.lastResponseId || '',
        },
      };
    },
  });

export const logQuickviewDocumentSuggestionClick = (
  suggestionId: string
): CaseAssistAction =>
  makeCaseAssistAnalyticsAction({
    prefix: 'analytics/caseAssist/documentSuggestion/click',
    __legacy__getBuilder: (client, state) => {
      return client.logSelectDocumentSuggestion({
        suggestion: caseAssistDocumentSuggestionSelector(
          state,
          suggestionId,
          true
        ),
        ticket: caseAssistCaseSelector(state),
      });
    },
    analyticsType: 'itemClick',
    analyticsPayloadBuilder: (state): ItemClick => {
      const {
        suggestion,
        responseId,
        suggestionId: uniqueId,
      } = caseAssistDocumentSuggestionSelector(state, suggestionId, true);
      return {
        searchUid: responseId,
        position: suggestion.documentPosition,
        actionCause: 'preview',
        itemMetadata: {
          uniqueFieldName: 'uniqueId',
          uniqueFieldValue: uniqueId,
          title: suggestion.documentTitle,
          url: suggestion.documentUrl,
        },
      };
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
    analyticsType: 'itemClick',
    analyticsPayloadBuilder: (state): ItemClick => {
      const {
        suggestion,
        responseId,
        suggestionId: uniqueId,
      } = caseAssistDocumentSuggestionSelector(state, suggestionId, true);
      return {
        searchUid: responseId,
        position: suggestion.documentPosition,
        actionCause: 'open',
        itemMetadata: {
          uniqueFieldName: 'uniqueId',
          uniqueFieldValue: uniqueId,
          title: suggestion.documentTitle,
          url: suggestion.documentUrl,
        },
      };
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
    analyticsType: 'caseAssist.documentSuggestionFeedback',
    analyticsPayloadBuilder: (state): CaseAssist.DocumentSuggestionFeedback => {
      return {
        documentSuggestion: {
          id: suggestionId,
          responseId: state.documentSuggestion?.status?.lastResponseId || '',
        },
        liked: !!rating,
      };
    },
  });
