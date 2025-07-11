import type {CoreEngine} from '../../../../app/engine.js';
import type {AllFacetSections} from '../../../../features/facets/generic/interfaces/generic-facet-section.js';
import {generateFacetId} from './facet-id-generator.js';

interface FacetIdConfig {
  facetId?: string;
  field: string;
}

export function determineFacetId(
  engine: CoreEngine<Partial<AllFacetSections>>,
  config: FacetIdConfig
) {
  const {state, logger} = engine;
  const {field, facetId} = config;
  return facetId || generateFacetId({field, state}, logger);
}
