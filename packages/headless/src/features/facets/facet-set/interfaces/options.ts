import {FacetOptions} from '../../../../controllers/core/facets/facet/headless-core-facet-options';

export type FacetOptionalParameters = Required<
  Pick<
    FacetOptions,
    'filterFacetCount' | 'injectionDepth' | 'numberOfValues' | 'sortCriteria'
  >
>;
