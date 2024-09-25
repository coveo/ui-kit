import {UniversalControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  FieldSuggestionsGenerator,
  buildFieldSuggestionsGenerator,
} from './headless-field-suggestions-generator.js';

export type {
  FieldSuggestions,
  FieldSuggestionsState,
} from '../field-suggestions/headless-field-suggestions.js';
export type {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsState,
} from '../field-suggestions/headless-category-field-suggestions.js';
export type {FieldSuggestionsFacet} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-state.js';
export type {GeneratedFieldSuggestionsControllers} from './headless-field-suggestions-generator.js';
export type {FieldSuggestionsGenerator};

export interface FieldSuggestionsGeneratorDefinition
  extends UniversalControllerDefinitionWithoutProps<FieldSuggestionsGenerator> {}

/**
 * Defines the `FieldSuggestionsGenerator` controller for the purpose of server-side rendering.
 *
 * @returns The `FieldSuggestionsGenerator` controller definition.
 *
 * @internal
 */
export function defineFieldSuggestionsGenerator(): FieldSuggestionsGeneratorDefinition {
  return {
    search: true,
    listing: true,
    standalone: true,
    build: (engine) => buildFieldSuggestionsGenerator(engine),
  };
}
