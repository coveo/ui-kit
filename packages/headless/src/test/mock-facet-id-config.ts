import {FacetIdConfig} from '../controllers/facets/_common/facet-id-generator';

export function buildMockFacetIdConfig(
  config: Partial<FacetIdConfig>
): FacetIdConfig {
  return {
    type: 'specific',
    field: '',
    state: {},
    ...config,
  };
}
