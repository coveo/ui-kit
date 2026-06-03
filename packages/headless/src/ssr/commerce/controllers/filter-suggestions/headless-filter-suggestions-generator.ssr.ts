import type {FieldSuggestionsFacet} from '../../../../api/commerce/search/query-suggest/query-suggest-response.js';
import type {
  CategoryFilterSuggestions,
  CategoryFilterSuggestionsState,
} from '../../../../controllers/commerce/filter-suggestions/headless-category-filter-suggestions.js';
import type {
  FilterSuggestions,
  FilterSuggestionsState,
} from '../../../../controllers/commerce/filter-suggestions/headless-filter-suggestions.js';
import {
  buildFilterSuggestionsGenerator,
  type FilterSuggestionsGenerator,
  type GeneratedFilterSuggestionsControllers,
} from '../../../../controllers/commerce/filter-suggestions/headless-filter-suggestions-generator.js';
import type {NonRecommendationControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {
  CategoryFilterSuggestions,
  CategoryFilterSuggestionsState,
  FieldSuggestionsFacet,
  FilterSuggestions,
  FilterSuggestionsGenerator,
  FilterSuggestionsState,
  GeneratedFilterSuggestionsControllers,
};

export interface FilterSuggestionsGeneratorDefinition extends NonRecommendationControllerDefinitionWithoutProps<FilterSuggestionsGenerator> {}

/**
 * Defines the `FilterSuggestionsGenerator` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @returns The `FilterSuggestionsGenerator` controller definition.
 */
export function defineFilterSuggestionsGenerator(): FilterSuggestionsGeneratorDefinition {
  return {
    search: true,
    listing: true,
    standalone: true,
    build: (engine) => buildFilterSuggestionsGenerator(engine),
  };
}
