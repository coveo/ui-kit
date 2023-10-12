import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {FacetManager, buildFacetManager} from './headless-facet-manager.js';

export * from './headless-facet-manager.js';

/**
 * @internal
 */
export const defineFacetManager = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  FacetManager
> => ({
  build: (engine) => buildFacetManager(engine),
});
