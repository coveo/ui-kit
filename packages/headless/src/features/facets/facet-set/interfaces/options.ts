import type {FacetOptions} from '../../../../controllers/core/facets/facet/headless-core-facet-options.js';

export type FacetOptionalParameters = Required<
  Pick<
    FacetOptions,
    | 'filterFacetCount'
    | 'injectionDepth'
    | 'numberOfValues'
    | 'sortCriteria'
    | 'resultsMustMatch'
  >
>;
