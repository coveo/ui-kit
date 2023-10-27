import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  SmartSnippet,
  SmartSnippetProps,
  buildSmartSnippet,
} from './headless-smart-snippet';

export * from './headless-smart-snippet';

/**
 * @alpha
 */
export const defineSmartSnippet = (
  props?: SmartSnippetProps
): ControllerDefinitionWithoutProps<SearchEngine, SmartSnippet> => ({
  build: (engine) => buildSmartSnippet(engine, props),
});
