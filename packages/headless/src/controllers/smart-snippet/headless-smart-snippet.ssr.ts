import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildSmartSnippet,
  type SmartSnippet,
  type SmartSnippetProps,
} from './headless-smart-snippet.js';

export * from './headless-smart-snippet.js';

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
