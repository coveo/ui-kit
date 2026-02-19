import type {FollowUpAnswerParams} from '../../api/knowledge/answer-generation/endpoints/follow-up/follow-up-endpoint.js';
import type {
  ConfigurationSection,
  FollowUpAnswersSection,
} from '../../state/state-sections.js';

export type StateNeededForFollowUpAnswerParams = FollowUpAnswersSection &
  ConfigurationSection;

export const constructGenerateFollowUpAnswerParams = (
  followUpQuestion: string,
  state: StateNeededForFollowUpAnswerParams
): FollowUpAnswerParams => {
  const conversationId = state.followUpAnswers?.conversationId ?? '';
  return {
    conversationId,
    q: followUpQuestion,
  };
};
