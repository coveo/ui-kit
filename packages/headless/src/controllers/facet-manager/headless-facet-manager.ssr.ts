import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildFacetManager,
  type FacetManager,
} from './headless-facet-manager.js';

export * from './headless-facet-manager.js';

export interface FacetManagerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, FacetManager> {}

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
