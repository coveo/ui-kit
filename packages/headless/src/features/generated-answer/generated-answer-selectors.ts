import {createSelector} from '@reduxjs/toolkit';
import {SearchAppState} from '../../state/search-app-state';
import {GeneratedAnswerSection} from '../../state/state-sections';

export const citationSourceSelector = createSelector(
  (state: Partial<GeneratedAnswerSection>, citationId: string) =>
    state.generatedAnswer?.citations?.find(
      (citation) => citation.id === citationId
    ),
  (citation) => citation
);

export const generativeQuestionAnsweringIdSelector = createSelector(
  (state: Partial<SearchAppState>) =>
    state.search?.response?.extendedResults?.generativeQuestionAnsweringId,
  (generativeQuestionAnsweringId) => generativeQuestionAnsweringId
);

export const selectFieldsToIncludeInCitation = createSelector(
  (state: Partial<GeneratedAnswerSection>) =>
    state.generatedAnswer?.fieldsToIncludeInCitations,
  (fieldsToInclude) => fieldsToInclude
);
