import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  SmartSnippet,
  SmartSnippetProps,
  buildSmartSnippet,
} from './headless-smart-snippet.js';

export * from './headless-smart-snippet.js';

/**
 * @internal
 */
export const defineSmartSnippet = (
  props?: SmartSnippetProps
): ControllerDefinitionWithoutProps<SearchEngine, SmartSnippet> => ({
  build: (engine) => buildSmartSnippet(engine, props),
});
