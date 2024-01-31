import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {SmartSnippetQuestionsListProps} from '../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list';
import {
  SmartSnippetQuestionsList,
  buildSmartSnippetQuestionsList,
} from './headless-smart-snippet-questions-list';

export * from './headless-smart-snippet-questions-list';

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
