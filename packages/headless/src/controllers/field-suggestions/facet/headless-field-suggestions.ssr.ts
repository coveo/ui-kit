import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  FieldSuggestions,
  FieldSuggestionsProps,
  buildFieldSuggestions,
} from './headless-field-suggestions';

export * from './headless-field-suggestions';

/**
 * Defines a `FieldSuggestions` controller instance.
 *
 * @param props - The configurable `FieldSuggestions` properties.
 * @returns The `FieldSuggestions` controller definition.
 * */
export function defineFieldSuggestions(
  props: FieldSuggestionsProps
): ControllerDefinitionWithoutProps<SearchEngine, FieldSuggestions> {
  return {
    build: (engine) => buildFieldSuggestions(engine, props),
  };
}
