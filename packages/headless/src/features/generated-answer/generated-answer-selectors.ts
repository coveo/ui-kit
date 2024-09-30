import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import {
  selectAnswer,
  StateNeededByAnswerAPI,
} from '../../api/knowledge/stream-answer-api.js';
import {GeneratedAnswerCitation} from '../../controllers/generated-answer/headless-generated-answer.js';
import {SearchAppState} from '../../state/search-app-state.js';
import {
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections.js';
import {selectQuery} from '../query/query-selectors.js';

export const generativeQuestionAnsweringIdSelector = (
  state: Partial<SearchAppState>
): {answerAPIEnabled: boolean; id: string | undefined} => {
  if (isGeneratedAnswerSection(state)) {
    return {answerAPIEnabled: true, id: selectAnswer(state).data?.answerId};
  }

  if (isSearchSection(state)) {
    return {
      answerAPIEnabled: false,
      id: state.search.response.extendedResults.generativeQuestionAnsweringId,
    };
  }

  return {answerAPIEnabled: false, id: undefined};
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
