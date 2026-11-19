import type {FieldSuggestionsFacet} from '@coveo/headless/commerce';
import type {
  CategoryFilterSuggestions,
  CategoryFilterSuggestionsState,
} from '@coveo/headless/commerce';
import type {FilterSuggestions, FilterSuggestionsState} from '@coveo/headless/commerce';
import {
  buildFilterSuggestionsGenerator,
  type FilterSuggestionsGenerator,
  type GeneratedFilterSuggestionsControllers,
} from '@coveo/headless/commerce';
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

export type FilterSuggestionsGeneratorDefinition =
  NonRecommendationControllerDefinitionWithoutProps<FilterSuggestionsGenerator>;

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
