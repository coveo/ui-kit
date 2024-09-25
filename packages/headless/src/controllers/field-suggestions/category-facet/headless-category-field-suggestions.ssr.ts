import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsProps,
  buildCategoryFieldSuggestions,
} from './headless-category-field-suggestions.js';

export * from './headless-category-field-suggestions.js';

export interface CategoryFieldSuggestionsDefinition
  extends ControllerDefinitionWithoutProps<
    SearchEngine,
    CategoryFieldSuggestions
  > {}

/**
 * Defines a `CategoryFieldSuggestions` controller instance.
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
