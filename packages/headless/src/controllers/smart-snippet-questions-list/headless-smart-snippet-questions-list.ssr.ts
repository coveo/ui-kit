import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListProps,
  buildSmartSnippetQuestionsList,
} from './headless-smart-snippet-questions-list';

export * from './headless-smart-snippet-questions-list';

/**
 * Defines a `SmartSnippetQuestionsList` controller instance.
 *
 * @param props - The configurable `SmartSnippetQuestionsList` properties.
 * @returns The `SmartSnippetQuestionsList` controller definition.
 * */
export function defineSmartSnippetQuestionsList(
  props?: SmartSnippetQuestionsListProps
): ControllerDefinitionWithoutProps<SearchEngine, SmartSnippetQuestionsList> {
  return {
    build: (engine) => buildSmartSnippetQuestionsList(engine, props),
  };
}
