import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import type {SmartSnippetQuestionsListProps} from '../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list.js';
import {
  buildSmartSnippetQuestionsList,
  type SmartSnippetQuestionsList,
} from './headless-smart-snippet-questions-list.js';

export * from './headless-smart-snippet-questions-list.js';

export interface SmartSnippetQuestionsListDefinition
  extends ControllerDefinitionWithoutProps<
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
