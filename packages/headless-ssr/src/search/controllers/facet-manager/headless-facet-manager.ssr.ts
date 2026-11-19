import type {SearchEngine} from '@coveo/headless';
import {buildFacetManager, type FacetManager} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {type FacetManager, type FacetManagerPayload, type FacetManagerState} from '@coveo/headless';

export interface FacetManagerDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  FacetManager
> {}

/**
 * Defines a `FacetManager` controller instance.
 * @group Definers
 *
 * @returns The `FacetManager` controller definition.
 * */
export function defineFacetManager(): FacetManagerDefinition {
  return {
    build: (engine) => buildFacetManager(engine),
  };
}
