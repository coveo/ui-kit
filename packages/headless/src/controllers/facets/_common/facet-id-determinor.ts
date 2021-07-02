import {SearchEngine} from '../../../app/search-engine/search-engine';
import {AllFacetSections} from '../../../features/facets/generic/interfaces/generic-facet-section';
import {generateFacetId} from './facet-id-generator';

interface FacetIdConfig {
  facetId?: string;
  field: string;
}

export function determineFacetId(
  engine: SearchEngine<Partial<AllFacetSections>>,
  config: FacetIdConfig
) {
  const {state, logger} = engine;
  const {field, facetId} = config;
  return facetId || generateFacetId({field, state}, logger);
}
