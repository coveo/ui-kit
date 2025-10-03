import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import type {StreamAnswerAPIState} from '../../api/knowledge/stream-answer-api-state.js';
import type {GeneratedAnswerCitation} from '../../controllers/generated-answer/headless-generated-answer.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import type {
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections.js';

export const generativeQuestionAnsweringIdSelector = (
  state: Partial<SearchAppState>
): string | undefined => {
  // If using the AnswerApi, we return the answerId first.
  if (isGeneratedAnswerSection(state)) {
    return state.generatedAnswer?.answerId;
  }

  // Used for type narrowing.
  if (isSearchSection(state)) {
    return state.search?.response?.extendedResults
      ?.generativeQuestionAnsweringId;
  }

  return undefined;
};

const isGeneratedAnswerSection = (
  state: Partial<SearchAppState>
): state is StreamAnswerAPIState =>
  'answer' in state &&
  'generatedAnswer' in state &&
  !isNullOrUndefined(state.generatedAnswer?.answerConfigurationId);

const isSearchSection = (
  state: Partial<SearchAppState> | StreamAnswerAPIState
): state is SearchSection =>
  'search' in state &&
  state.search !== undefined &&
  typeof state.search === 'object';

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
