import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  SmartSnippet,
  SmartSnippetProps,
  buildSmartSnippet,
} from './headless-smart-snippet';

export * from './headless-smart-snippet';

/**
 * Defines a `SmartSnippet` controller instance.
 *
 * @param props - The configurable `SmartSnippet` properties.
 * @returns The `SmartSnippet` controller definition.
 * */
export function defineSmartSnippet(
  props?: SmartSnippetProps
): ControllerDefinitionWithoutProps<SearchEngine, SmartSnippet> {
  return {
    build: (engine) => buildSmartSnippet(engine, props),
  };
}
