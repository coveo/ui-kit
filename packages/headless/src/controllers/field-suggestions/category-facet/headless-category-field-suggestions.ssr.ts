import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsProps,
  buildCategoryFieldSuggestions,
} from './headless-category-field-suggestions';

export type {
  CategoryFieldSuggestionsValue,
  CategoryFieldSuggestionsState,
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsOptions,
  CategoryFieldSuggestionsProps,
} from './headless-category-field-suggestions';

/**
 * @internal
 */
export const defineCategoryFieldSuggestions = (
  props: CategoryFieldSuggestionsProps
): ControllerDefinitionWithoutProps<
  SearchEngine,
  CategoryFieldSuggestions
> => ({
  build: (engine) => buildCategoryFieldSuggestions(engine, props),
});
