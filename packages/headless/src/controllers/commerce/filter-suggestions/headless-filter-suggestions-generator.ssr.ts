import type {NonRecommendationControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  buildFilterSuggestionsGenerator,
  type FilterSuggestionsGenerator,
} from './headless-filter-suggestions-generator.js';

export type {FieldSuggestionsFacet} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-state.js';
export type {
  CategoryFilterSuggestions,
  CategoryFilterSuggestionsState,
} from './headless-category-filter-suggestions.js';
export type {
  FilterSuggestions,
  FilterSuggestionsState,
} from './headless-filter-suggestions.js';
export type {GeneratedFilterSuggestionsControllers} from './headless-filter-suggestions-generator.js';
export type {FilterSuggestionsGenerator};

export interface FilterSuggestionsGeneratorDefinition
  extends NonRecommendationControllerDefinitionWithoutProps<FilterSuggestionsGenerator> {}

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
