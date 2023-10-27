import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {FacetManager, buildFacetManager} from './headless-facet-manager';

export * from './headless-facet-manager';

/**
 * @alpha
 */
export const defineFacetManager = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  FacetManager
> => ({
  build: (engine) => buildFacetManager(engine),
});
