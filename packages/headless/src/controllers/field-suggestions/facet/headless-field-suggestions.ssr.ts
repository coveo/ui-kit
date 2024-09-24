import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  FieldSuggestions,
  FieldSuggestionsProps,
  buildFieldSuggestions,
} from './headless-field-suggestions.js';

export * from './headless-field-suggestions.js';

export interface FieldSuggestionsDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, FieldSuggestions> {}

/**
 * Defines a `FieldSuggestions` controller instance.
 *
 * @param props - The configurable `FieldSuggestions` properties.
 * @returns The `FieldSuggestions` controller definition.
 * */
export function defineFieldSuggestions(
  props: FieldSuggestionsProps
): FieldSuggestionsDefinition {
  return {
    build: (engine) => buildFieldSuggestions(engine, props),
  };
}
