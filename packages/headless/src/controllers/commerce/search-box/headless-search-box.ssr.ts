import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {SearchBox, buildSearchBox} from './headless-search-box';

export type {SearchBoxState, SearchBox} from './headless-search-box';

export interface SearchBoxDefinition
  extends ControllerDefinitionWithoutProps<CommerceEngine, SearchBox> {}

/**
 * Defines a `SearchBox` controller instance.
 *
 * @returns The `SearchBox` controller definition.
 *
 * @internal
 */
export function defineSearchBox(): SearchBoxDefinition {
  return {
    build: (engine) => buildSearchBox(engine),
  };
}
