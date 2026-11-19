import type {SearchEngine} from '@coveo/headless';
import {
  buildCategoryFieldSuggestions,
  type CategoryFieldSuggestions,
  type CategoryFieldSuggestionsProps,
} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../../types/controller-definition.js';

export {
  type CategoryFieldSuggestionsValue,
  type CategoryFieldSuggestionsState,
  type CategoryFieldSuggestions,
  type CategoryFieldSuggestionsOptions,
  type CategoryFieldSuggestionsProps,
} from '@coveo/headless';

export interface CategoryFieldSuggestionsDefinition extends ControllerDefinitionWithoutProps<
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
