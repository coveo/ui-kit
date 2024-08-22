import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import {
  selectAnswer,
  StateNeededByAnswerAPI,
} from '../../api/knowledge/stream-answer-api';
import {GeneratedAnswerCitation} from '../../controllers/generated-answer/headless-generated-answer';
import {SearchAppState} from '../../state/search-app-state';
import {
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections';
import {selectQuery} from '../query/query-selectors';

export const generativeQuestionAnsweringIdSelector = (
  state: Partial<SearchAppState>
) => {
  if (isGeneratedAnswerSection(state)) {
    return selectAnswer(state).data?.answerId;
  }

  if (isSearchSection(state)) {
    return state.search.response.extendedResults.generativeQuestionAnsweringId;
  }

  return undefined;
};

const isSearchSection = (
  state: Partial<SearchAppState> | StateNeededByAnswerAPI
): state is SearchSection => 'search' in state;

const isGeneratedAnswerSection = (
  state: Partial<SearchAppState>
): state is StateNeededByAnswerAPI =>
  'answer' in state &&
  'generatedAnswer' in state &&
  !isNullOrUndefined(state.generatedAnswer?.answerConfigurationId);

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
