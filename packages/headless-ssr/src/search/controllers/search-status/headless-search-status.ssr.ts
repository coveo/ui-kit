import type {SearchEngine} from '@coveo/headless';
import {buildSearchStatus, type SearchStatus} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {type SearchStatus, type SearchStatusState} from '@coveo/headless';

export interface SearchStatusDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  SearchStatus
> {}

/**
 * Defines a `SearchStatus` controller instance.
 * @group Definers
 *
 * @returns The `SearchStatus` controller definition.
 * */
export function defineSearchStatus(): SearchStatusDefinition {
  return {
    build: (engine) => buildSearchStatus(engine),
  };
}
