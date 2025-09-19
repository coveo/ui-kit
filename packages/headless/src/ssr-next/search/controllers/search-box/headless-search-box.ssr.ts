import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildSearchBox,
  type SearchBox,
  type SearchBoxProps,
} from '../../../../controllers/search-box/headless-search-box.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/search-box/headless-search-box.js';

export interface SearchBoxDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, SearchBox> {}

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
