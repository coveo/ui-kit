import {isNullOrUndefined} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import type {StreamAnswerAPIState} from '../../api/knowledge/stream-answer-api-state.js';
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

const getHeadCitations = (
  state: Partial<GeneratedAnswerSection & FollowUpAnswersSection>
) => state.generatedAnswer?.citations;

const getFollowUpAnswers = (
  state: Partial<GeneratedAnswerSection & FollowUpAnswersSection>
) => state.followUpAnswers?.followUpAnswers;

const getFlatFollowUpCitations = createSelector(
  getFollowUpAnswers,
  (followUpAnswers) => followUpAnswers?.flatMap((f) => f.citations)
);

const getCitationId = (
  _state: Partial<GeneratedAnswerSection & FollowUpAnswersSection>,
  citationId: string
) => citationId;

/**
 * Looks up a citation by its ID across the head answer and all follow-up answers.
 *
 * A citation with the same ID can appear in multiple answers (e.g., the same
 * source cited in both answer 2 and answer 4). This selector returns the first
 * match it finds (head answer first, then follow-ups) and is only used to
 * retrieve the citation's document metadata (permanentid, title, clickUri, etc.)
 * for analytics payloads. Since identical citations share the same metadata
 * regardless of which answer they belong to, this is safe.
 *
 * The `answerId` — which determines *which answer* the interaction is
 * attributed to — is tracked separately by the caller and is never derived
 * from this selector.
 */
export const citationSourceSelector = createSelector(
  getHeadCitations,
  getFlatFollowUpCitations,
  getCitationId,
  (headCitations, flatFollowUpCitations, citationId) =>
    headCitations?.find((citation) => citation.id === citationId) ??
    flatFollowUpCitations?.find((citation) => citation.id === citationId)
);
