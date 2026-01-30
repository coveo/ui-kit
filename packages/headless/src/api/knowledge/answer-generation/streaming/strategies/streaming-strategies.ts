import {createFollowUpAnswerStrategy} from '../../../../../features/follow-up-answers/follow-up-answer-strategy.js';
import {createHeadAnswerStrategy} from '../../../../../features/generated-answer/head-answer-strategy.js';

export const streamingStrategiesCreator = {
  'head-answer': createHeadAnswerStrategy,
  'follow-up-answer': createFollowUpAnswerStrategy,
};
