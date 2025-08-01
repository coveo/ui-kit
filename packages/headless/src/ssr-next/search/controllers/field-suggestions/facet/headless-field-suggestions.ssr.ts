import type {SearchEngine} from '../../../../../app/search-engine/search-engine.js';
import {
  buildFieldSuggestions,
  type FieldSuggestions,
  type FieldSuggestionsProps,
} from '../../../../../controllers/field-suggestions/facet/headless-field-suggestions.js';
import type {ControllerDefinitionWithoutProps} from '../../../../common/types/controllers.js';

export * from '../../../../../controllers/field-suggestions/facet/headless-field-suggestions.js';

export interface FieldSuggestionsDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, FieldSuggestions> {}

/**
 * Defines a `FieldSuggestions` controller instance.
 * @group Definers
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
