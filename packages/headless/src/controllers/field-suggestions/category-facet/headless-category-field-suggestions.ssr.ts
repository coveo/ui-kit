import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  buildCategoryFieldSuggestions,
  type CategoryFieldSuggestions,
  type CategoryFieldSuggestionsProps,
} from './headless-category-field-suggestions.js';

export * from './headless-category-field-suggestions.js';

export interface CategoryFieldSuggestionsDefinition
  extends ControllerDefinitionWithoutProps<
    SearchEngine,
    CategoryFieldSuggestions
  > {}

/**
 * Defines a `CategoryFieldSuggestions` controller instance.
 * @group Definers
 *
 * @param props - The configurable `CategoryFieldSuggestions` properties.
 * @returns The `CategoryFieldSuggestions` controller definition.
 * */
export function defineCategoryFieldSuggestions(
  props: CategoryFieldSuggestionsProps
): CategoryFieldSuggestionsDefinition {
  return {
    build: (engine) => buildCategoryFieldSuggestions(engine, props),
  };
}
