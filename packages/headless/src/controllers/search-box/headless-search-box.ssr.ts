import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {SearchBox, SearchBoxProps, buildSearchBox} from './headless-search-box';

export * from './headless-search-box';

export interface SearchBoxDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, SearchBox> {}

/**
 * Defines a `SearchBox` controller instance.
 *
 * @param props - The configurable `SearchBox` properties.
 * @returns The `SearchBox` controller definition.
 * */
export function defineSearchBox(props?: SearchBoxProps): SearchBoxDefinition {
  return {
    build: (engine) => buildSearchBox(engine, props),
  };
}
