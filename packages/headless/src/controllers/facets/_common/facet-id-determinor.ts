import {Engine} from '../../../app/headless-engine';
import {AllFacetSections} from '../../../features/facets/generic/interfaces/generic-facet-section';
import {generateFacetId, isBeingUsedAsFacetId} from './facet-id-generator';

interface FacetIdConfig {
  facetId?: string;
  field: string;
}

export function determineFacetId(
  engine: Engine<Partial<AllFacetSections>>,
  config: FacetIdConfig
) {
  const {state, logger} = engine;
  const {field, facetId} = config;
  const generateId = () => generateFacetId({field, state}, logger);

  if (!facetId) {
    return generateId();
  }

  if (isBeingUsedAsFacetId(state, facetId)) {
    const message = `Generating a facet id because the passed facet id "${facetId}" is already being used.
    Please ensure facet ids are unique.`;

    engine.logger.warn(message);
    return generateId();
  }

  return facetId;
}
