import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  SmartSnippet,
  SmartSnippetProps,
  buildSmartSnippet,
} from './headless-smart-snippet';

export type {
  SmartSnippet,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
  QuestionAnswerDocumentIdentifier,
  SmartSnippetCore,
} from './headless-smart-snippet';

/**
 * @internal
 */
export const defineSmartSnippet = (
  props?: SmartSnippetProps
): ControllerDefinitionWithoutProps<SearchEngine, SmartSnippet> => ({
  build: (engine) => buildSmartSnippet(engine, props),
});
