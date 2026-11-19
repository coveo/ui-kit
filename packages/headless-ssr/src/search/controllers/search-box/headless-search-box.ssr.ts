import type {SearchEngine} from '@coveo/headless';
import {buildSearchBox, type SearchBox, type SearchBoxProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type Delimiters,
  type SearchBoxOptions,
  type SearchBoxState,
  type Suggestion,
  type SuggestionHighlightingOptions,
  type SearchBoxProps,
  type SearchBox,
} from '@coveo/headless';

export interface SearchBoxDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  SearchBox
> {}

/**
 * Defines a `SearchBox` controller instance.
 * @group Definers
 *
 * @param props - The configurable `SearchBox` properties.
 * @returns The `SearchBox` controller definition.
 * */
export function defineSearchBox(props?: SearchBoxProps): SearchBoxDefinition {
  return {
    build: (engine) => buildSearchBox(engine, props),
  };
}
