import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListProps,
  buildSmartSnippetQuestionsList,
} from './headless-smart-snippet-questions-list';

export * from './headless-smart-snippet-questions-list';

/**
 * @alpha
 */
export const defineSmartSnippetQuestionsList = (
  props?: SmartSnippetQuestionsListProps
): ControllerDefinitionWithoutProps<
  SearchEngine,
  SmartSnippetQuestionsList
> => ({
  build: (engine) => buildSmartSnippetQuestionsList(engine, props),
});
