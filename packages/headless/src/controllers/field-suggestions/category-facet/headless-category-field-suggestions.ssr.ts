import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsProps,
  buildCategoryFieldSuggestions,
} from './headless-category-field-suggestions';

export * from './headless-category-field-suggestions';

/**
 * Defines a `CategoryFieldSuggestions` controller instance.
 *
 * @param props - The configurable `CategoryFieldSuggestions` properties.
 * @returns The `CategoryFieldSuggestions` controller definition.
 * */
export function defineCategoryFieldSuggestions(
  props: CategoryFieldSuggestionsProps
): ControllerDefinitionWithoutProps<SearchEngine, CategoryFieldSuggestions> {
  return {
    build: (engine) => buildCategoryFieldSuggestions(engine, props),
  };
}
