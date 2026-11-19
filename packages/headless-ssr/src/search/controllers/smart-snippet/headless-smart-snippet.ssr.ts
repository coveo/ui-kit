import type {SearchEngine} from '@coveo/headless';
import {buildSmartSnippet, type SmartSnippet, type SmartSnippetProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type QuestionAnswerDocumentIdentifier,
  type SmartSnippet,
  type SmartSnippetCore,
  type SmartSnippetOptions,
  type SmartSnippetProps,
  type SmartSnippetState,
} from '@coveo/headless';

export interface SmartSnippetDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  SmartSnippet
> {}

/**
 * Defines a `SmartSnippet` controller instance.
 * @group Definers
 *
 * @param props - The configurable `SmartSnippet` properties.
 * @returns The `SmartSnippet` controller definition.
 * */
export function defineSmartSnippet(props?: SmartSnippetProps): SmartSnippetDefinition {
  return {
    build: (engine) => buildSmartSnippet(engine, props),
  };
}
