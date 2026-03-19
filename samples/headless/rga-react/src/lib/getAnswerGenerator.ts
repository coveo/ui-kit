/* lib/getAnswerGenerator.ts */
import {
  buildGeneratedAnswer,
  type GeneratedAnswer,
  type GeneratedAnswerProps,
  type SearchEngine,
} from '@coveo/headless';

export const getAnswerGenerator = (
  engine: SearchEngine,
  props?: GeneratedAnswerProps
): GeneratedAnswer => {
  return buildGeneratedAnswer(engine, props);
};
