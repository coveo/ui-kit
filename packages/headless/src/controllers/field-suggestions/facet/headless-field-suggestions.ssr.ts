import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  FieldSuggestions,
  FieldSuggestionsProps,
  buildFieldSuggestions,
} from './headless-field-suggestions';

export * from './headless-field-suggestions';

/**
 * @alpha
 */
export const defineFieldSuggestions = (
  props: FieldSuggestionsProps
): ControllerDefinitionWithoutProps<SearchEngine, FieldSuggestions> => ({
  build: (engine) => buildFieldSuggestions(engine, props),
});
