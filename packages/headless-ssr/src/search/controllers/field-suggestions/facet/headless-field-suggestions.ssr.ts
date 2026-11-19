import type {SearchEngine} from '@coveo/headless';
import {
  buildFieldSuggestions,
  type FieldSuggestions,
  type FieldSuggestionsProps,
} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../../types/controller-definition.js';

export {
  type FieldSuggestionsValue,
  type FieldSuggestionsState,
  type FieldSuggestions,
  type FieldSuggestionsOptions,
  type FieldSuggestionsProps,
} from '@coveo/headless';

export interface FieldSuggestionsDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  FieldSuggestions
> {}

/**
 * Defines a `FieldSuggestions` controller instance.
 * @group Definers
 *
 * @param props - The configurable `FieldSuggestions` properties.
 * @returns The `FieldSuggestions` controller definition.
 * */
export function defineFieldSuggestions(props: FieldSuggestionsProps): FieldSuggestionsDefinition {
  return {
    build: (engine) => buildFieldSuggestions(engine, props),
  };
}
