import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildSmartSnippet,
  type SmartSnippet,
  type SmartSnippetProps,
} from '../../../../controllers/smart-snippet/headless-smart-snippet.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/smart-snippet/headless-smart-snippet.js';

export interface SmartSnippetDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, SmartSnippet> {}

/**
 * Defines a `SmartSnippet` controller instance.
 * @group Definers
 *
 * @param props - The configurable `SmartSnippet` properties.
 * @returns The `SmartSnippet` controller definition.
 * */
export function defineSmartSnippet(
  props?: SmartSnippetProps
): SmartSnippetDefinition {
  return {
    build: (engine) => buildSmartSnippet(engine, props),
  };
}
