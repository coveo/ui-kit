import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {FollowUpAnswerParams} from '../../api/knowledge/answer-generation/endpoints/follow-up/follow-up-endpoint.js';

export const constructGenerateFollowUpAnswerParams = (
  followUpQuestion: string,
  state: AnswerGenerationApiState
): FollowUpAnswerParams => {
  const conversationId = state.followUpAnswers?.conversationId ?? '';
  return {
    conversationId,
    q: followUpQuestion,
  };
};
