/* lib/engines.ts */
import type {
  GeneratedAnswer,
  GeneratedAnswerProps,
  SearchEngine,
} from '@coveo/headless';
import {getAnswerGenerator} from './getAnswerGenerator.js';
import {getSearchEngine} from './getSearchEngine.js';

export const headlessEngine: SearchEngine = getSearchEngine();

export const answerGenerator = (
  props?: GeneratedAnswerProps
): GeneratedAnswer => {
  return getAnswerGenerator(headlessEngine, props);
};
