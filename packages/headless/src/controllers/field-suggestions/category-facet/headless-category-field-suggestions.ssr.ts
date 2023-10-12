import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common.js';
import {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsProps,
  buildCategoryFieldSuggestions,
} from './headless-category-field-suggestions.js';

export * from './headless-category-field-suggestions.js';

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
