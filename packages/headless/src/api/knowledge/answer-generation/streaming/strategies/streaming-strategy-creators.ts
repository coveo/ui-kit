import {createFollowUpAnswerStrategy} from '../../../../../features/follow-up-answers/follow-up-answer-strategy.js';
import {createHeadAnswerStrategy} from '../../../../../features/generated-answer/head-answer-strategy.js';

export const streamingStrategyCreators = {
  'head-answer': createHeadAnswerStrategy,
  'follow-up-answer': createFollowUpAnswerStrategy,
};
