import {createSelector} from '@reduxjs/toolkit';
import {GeneratedAnswerCitation} from '../../controllers/generated-answer/headless-generated-answer';
import {SearchAppState} from '../../state/search-app-state';
import {GeneratedAnswerSection} from '../../state/state-sections';
import {selectQuery} from '../query/query-selectors';

export const generativeQuestionAnsweringIdSelector = (
  state: Partial<SearchAppState>
) => state.search?.response?.extendedResults?.generativeQuestionAnsweringId;

export const selectFieldsToIncludeInCitation = (
  state: Partial<GeneratedAnswerSection>
) => state.generatedAnswer?.fieldsToIncludeInCitations;

export const citationSourceSelector = createSelector(
  (state: Partial<GeneratedAnswerSection>) => state.generatedAnswer?.citations,
  (_state: Partial<GeneratedAnswerSection>, citationId: string) => citationId,
  (citations, citationId) =>
    citations?.find(
      (citation: GeneratedAnswerCitation) => citation.id === citationId
    )
);

export const selectAnswerTriggerParams = createSelector(
  (state) => selectQuery(state)?.q,
  (state) => state.search.requestId,
  (q, requestId) => ({q, requestId})
);
