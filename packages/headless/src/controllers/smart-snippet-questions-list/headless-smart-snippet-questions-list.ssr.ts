import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListProps,
  buildSmartSnippetQuestionsList,
} from './headless-smart-snippet-questions-list.js';

export * from './headless-smart-snippet-questions-list.js';

/**
 * @internal
 */
export const defineSmartSnippetQuestionsList = (
  props?: SmartSnippetQuestionsListProps
): ControllerDefinitionWithoutProps<
  SearchEngine,
  SmartSnippetQuestionsList
> => ({
  build: (engine) => buildSmartSnippetQuestionsList(engine, props),
});
