import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import {selectFieldsToIncludeInCitation} from '../generated-answer/generated-answer-selectors.js';
import {selectPipeline} from '../pipeline/select-pipeline.js';
import {selectSearchHub} from '../search-hub/search-hub-selectors.js';

export type FollowUpAnswerParams = ReturnType<
  typeof constructGenerateFollowUpAnswerParams
>;

export const constructGenerateFollowUpAnswerParams = (
  followUpQuestion: string,
  state: AnswerGenerationApiState
) => {
  const conversationId = state.followUpAnswers.id;

  const searchHub = selectSearchHub(state);
  const pipeline = selectPipeline(state);
  const citationsFieldToInclude = selectFieldsToIncludeInCitation(state) ?? [];

  return {
    conversationId,
    q: followUpQuestion,
    pipelineRuleParameters: {
      mlGenerativeQuestionAnswering: {
        responseFormat: state.generatedAnswer.responseFormat,
        citationsFieldToInclude,
      },
    },
    ...(searchHub?.length && {searchHub}),
    ...(pipeline?.length && {pipeline}),
  };
};
