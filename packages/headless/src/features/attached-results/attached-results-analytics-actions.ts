import type {InsightPanel} from '@coveo/relay-event-types';
import type {Result} from '../../api/search/search/result.js';
import type {GeneratedAnswerCitation} from '../../index.js';
import {
  analyticsEventItemMetadata,
  analyticsEventItemMetadataForCitations,
  citationDocumentIdentifier,
  documentIdentifier,
  makeInsightAnalyticsActionFactory,
  partialCitationInformation,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils.js';
import {analyticsEventCaseContext} from '../analytics/insight-analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import {generativeQuestionAnsweringIdSelector} from '../generated-answer/generated-answer-selectors.js';

export const logCaseAttach = (result: Result) =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.caseAttach)({
    prefix: 'insight/caseAttach',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logCaseAttach(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    },
    analyticsType: 'InsightPanel.ItemAction',
    analyticsPayloadBuilder: (state): InsightPanel.ItemAction => {
      const information = partialDocumentInformation(result, state);
      return {
        itemMetadata: analyticsEventItemMetadata(result, state),
        position: information.documentPosition,
        responseId: state.search?.response.searchUid || '',
        action: 'attach',
        context: analyticsEventCaseContext(state),
      };
    },
  });

export const logCaseDetach = (result: Result) =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.caseDetach)({
    prefix: 'insight/caseDetach',
    __legacy__getBuilder: (client, state) => {
      return client.logCaseDetach(
        result.raw.urihash,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'InsightPanel.DetachItem',
    analyticsPayloadBuilder: (state): InsightPanel.DetachItem => {
      return {
        itemMetadata: analyticsEventItemMetadata(result, state),
        context: analyticsEventCaseContext(state),
      };
    },
  });

export const logCitationDocumentAttach = (citation: GeneratedAnswerCitation) =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.generatedAnswerCitationDocumentAttach
  )({
    prefix: 'insight/generatedAnswerCitationDocumentAttach',
    __legacy__getBuilder: (client, state) => {
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);

      if (!generativeQuestionAnsweringId || !citation) {
        return null;
      }

      const citationPayload = {
        generativeQuestionAnsweringId,
        citationId: citation.id,
        documentId: citationDocumentIdentifier(citation),
      };
      return client.logGeneratedAnswerCitationDocumentAttach(
        partialCitationInformation(citation, state),
        citationPayload,
        metadata
      );
    },
  });

export const logCitationDocumentDetach = (citation: GeneratedAnswerCitation) =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.caseDetach)({
    prefix: 'insight/caseDetach',
    __legacy__getBuilder: (client, state) => {
      const uriHash = citation.fields?.urihash || '';
      return client.logCaseDetach(
        uriHash,
        getCaseContextAnalyticsMetadata(state.insightCaseContext),
        citation.permanentId
      );
    },
    analyticsType: 'InsightPanel.DetachItem',
    analyticsPayloadBuilder: (state): InsightPanel.DetachItem => {
      return {
        itemMetadata: analyticsEventItemMetadataForCitations(citation, state),
        context: analyticsEventCaseContext(state),
      };
    },
  });
