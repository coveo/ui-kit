import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  SmartSnippet,
  SmartSnippetProps,
  buildSmartSnippet,
} from './headless-smart-snippet.js';

export * from './headless-smart-snippet.js';

export interface SmartSnippetDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, SmartSnippet> {}

/**
 * Defines a `SmartSnippet` controller instance.
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
