import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {FacetManager, buildFacetManager} from './headless-facet-manager';

export * from './headless-facet-manager';

/**
 * Defines a `FacetManager` controller instance.
 *
 * @returns The `FacetManager` controller definition.
 * */
export function defineFacetManager(): ControllerDefinitionWithoutProps<
  SearchEngine,
  FacetManager
> {
  return {
    build: (engine) => buildFacetManager(engine),
  };
}
