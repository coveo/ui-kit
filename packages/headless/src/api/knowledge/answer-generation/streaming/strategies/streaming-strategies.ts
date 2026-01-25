import {followUpAnswerStrategy} from '../../../../../features/follow-up-answers/follow-up-answer-strategy.js';
import {headAnswerStrategy} from '../../../../../features/generated-answer/head-answer-strategy.js';

export const streamingStrategies = {
  'head-answer': headAnswerStrategy,
  'follow-up-answer': followUpAnswerStrategy,
};
