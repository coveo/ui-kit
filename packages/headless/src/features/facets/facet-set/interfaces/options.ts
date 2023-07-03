import {FacetOptions} from '../../../../product-listing.index';

export type FacetOptionalParameters = Required<
  Pick<
    FacetOptions,
    'filterFacetCount' | 'injectionDepth' | 'numberOfValues' | 'sortCriteria'
  >
>;
