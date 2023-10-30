import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {AutomaticFacet} from '../automatic-facet-generator/headless-automatic-facet-generator';
import {
  AutomaticFacetProps,
  buildAutomaticFacet,
} from './headless-automatic-facet';

export * from './headless-automatic-facet';

/**
 * @internal
 */
export const defineAutomaticFacet = (
  props: AutomaticFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, AutomaticFacet> => ({
  build: (engine) => buildAutomaticFacet(engine, props),
});
