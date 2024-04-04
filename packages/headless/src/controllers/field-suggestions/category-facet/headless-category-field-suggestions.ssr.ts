import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsProps,
  buildCategoryFieldSuggestions,
} from './headless-category-field-suggestions';

export * from './headless-category-field-suggestions';

/**
 * @alpha
 */
export const defineCategoryFieldSuggestions = (
  props: CategoryFieldSuggestionsProps
): ControllerDefinitionWithoutProps<
  SearchEngine,
  CategoryFieldSuggestions
> => ({
  build: (engine) => buildCategoryFieldSuggestions(engine, props),
});
