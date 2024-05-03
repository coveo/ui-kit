import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {SmartSnippetQuestionsListProps} from '../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list';
import {
  SmartSnippetQuestionsList,
  buildSmartSnippetQuestionsList,
} from './headless-smart-snippet-questions-list';

export * from './headless-smart-snippet-questions-list';

export interface SmartSnippetQuestionsListDefinition
  extends ControllerDefinitionWithoutProps<
    SearchEngine,
    SmartSnippetQuestionsList
  > {}

/**
 * Defines a `SmartSnippetQuestionsList` controller instance.
 *
 * @param props - The configurable `SmartSnippetQuestionsList` properties.
 * @returns The `SmartSnippetQuestionsList` controller definition.
 * */
export function defineSmartSnippetQuestionsList(
  props?: SmartSnippetQuestionsListProps
): SmartSnippetQuestionsListDefinition {
  return {
    build: (engine) => buildSmartSnippetQuestionsList(engine, props),
  };
}
