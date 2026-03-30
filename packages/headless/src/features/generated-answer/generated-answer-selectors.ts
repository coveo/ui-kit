import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import type {StreamAnswerAPIState} from '../../api/knowledge/stream-answer-api-state.js';
import type {GeneratedAnswerCitation} from '../../controllers/generated-answer/headless-generated-answer.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import type {
  FollowUpAnswersSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections.js';
import {selectAgentId} from '../configuration/configuration-selectors.js';
import type {ConfigurationState} from '../configuration/configuration-state.js';

export const generativeQuestionAnsweringIdSelector = (
  state: Partial<SearchAppState>
): string | undefined => {
  // If using the AnswerApi or the AgentApi, we return the answerId first.
  if (
    isGeneratedAnswerFeatureEnabledWithAnswerAPI(state) ||
    isGeneratedAnswerFeatureEnabledWithAgentAPI(state)
  ) {
    return state.generatedAnswer?.answerId;
  }

  // Used for type narrowing.
  if (isSearchSection(state)) {
    return state.search?.response?.extendedResults
      ?.generativeQuestionAnsweringId;
  }

  return undefined;
};

const isGeneratedAnswerFeatureEnabledWithAnswerAPI = (
  state: Partial<SearchAppState>
): state is StreamAnswerAPIState =>
  'answer' in state &&
  'generatedAnswer' in state &&
  !isNullOrUndefined(state.generatedAnswer?.answerConfigurationId);

export const isGeneratedAnswerFeatureEnabledWithAgentAPI = (
  state: Partial<SearchAppState>
): state is StreamAnswerAPIState => {
  const agentId = selectAgentId(state as {configuration: ConfigurationState});
  return (
    'generatedAnswer' in state &&
    typeof agentId === 'string' &&
    agentId.trim().length > 0
  );
};

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
  (state: Partial<GeneratedAnswerSection & FollowUpAnswersSection>) =>
    state.generatedAnswer?.citations,
  (state: Partial<GeneratedAnswerSection & FollowUpAnswersSection>) =>
    state.followUpAnswers?.followUpAnswers,
  (
    _state: Partial<GeneratedAnswerSection & FollowUpAnswersSection>,
    citationId: string
  ) => citationId,
  (headCitations, followUpAnswers, citationId) => {
    const findCitation = (citations: GeneratedAnswerCitation[] | undefined) =>
      citations?.find((citation) => citation.id === citationId);

    return (
      findCitation(headCitations) ??
      followUpAnswers
        ?.find((followUp) => findCitation(followUp.citations))
        ?.citations.find((citation) => citation.id === citationId)
    );
  }
);
