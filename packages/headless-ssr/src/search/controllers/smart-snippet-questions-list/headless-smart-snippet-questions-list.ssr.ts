import type {SearchEngine} from '@coveo/headless';
import type {SmartSnippetQuestionsListProps} from '@coveo/headless';
import {buildSmartSnippetQuestionsList, type SmartSnippetQuestionsList} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type CoreSmartSnippetQuestionsList,
  type CoreSmartSnippetQuestionsListState,
  type SmartSnippetQuestionsListOptions,
  type SmartSnippetQuestionsListProps,
  type SmartSnippetRelatedQuestion,
  type SmartSnippetQuestionsListState,
  type SmartSnippetQuestionsList,
} from '@coveo/headless';

export interface SmartSnippetQuestionsListDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  SmartSnippetQuestionsList
> {}

/**
 * Defines a `SmartSnippetQuestionsList` controller instance.
 * @group Definers
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
