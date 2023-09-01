import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  FieldSuggestions,
  FieldSuggestionsProps,
  buildFieldSuggestions,
} from './headless-field-suggestions';

export type {
  FieldSuggestionsValue,
  FieldSuggestionsState,
  FieldSuggestions,
  FieldSuggestionsOptions,
  FieldSuggestionsProps,
} from './headless-field-suggestions';

/**
 * @internal
 */
export const defineFieldSuggestions = (
  props: FieldSuggestionsProps
): ControllerDefinitionWithoutProps<SearchEngine, FieldSuggestions> => ({
  build: (engine) => buildFieldSuggestions(engine, props),
});
