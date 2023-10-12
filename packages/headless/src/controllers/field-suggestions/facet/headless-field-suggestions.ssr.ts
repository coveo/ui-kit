import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  FieldSuggestions,
  FieldSuggestionsProps,
  buildFieldSuggestions,
} from './headless-field-suggestions.js';

export * from './headless-field-suggestions.js';

/**
 * @internal
 */
export const defineFieldSuggestions = (
  props: FieldSuggestionsProps
): ControllerDefinitionWithoutProps<SearchEngine, FieldSuggestions> => ({
  build: (engine) => buildFieldSuggestions(engine, props),
});
