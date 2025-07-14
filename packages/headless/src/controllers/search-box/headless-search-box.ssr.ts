import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildSearchBox,
  type SearchBox,
  type SearchBoxProps,
} from './headless-search-box.js';

export * from './headless-search-box.js';

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
