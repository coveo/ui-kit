import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  AutomaticFacet,
  AutomaticFacetProps,
  buildAutomaticFacet,
} from './headless-automatic-facet';

export * from './headless-automatic-facet';

/**
 * @alpha // EXPLORE ? MAY NEED TO REMOVE
 */
export const defineAutomaticFacet = (
  props: AutomaticFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, AutomaticFacet> => ({
  build: (engine) => buildAutomaticFacet(engine, props),
});
