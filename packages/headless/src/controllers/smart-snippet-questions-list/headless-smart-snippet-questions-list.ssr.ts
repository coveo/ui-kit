import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListProps,
  buildSmartSnippetQuestionsList,
} from './headless-smart-snippet-questions-list';

export type {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
  CoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsListState,
} from './headless-smart-snippet-questions-list';

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
