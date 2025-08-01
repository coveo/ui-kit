import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildFacetManager,
  type FacetManager,
} from '../../../../controllers/facet-manager/headless-facet-manager.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/facet-manager/headless-facet-manager.js';

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
