import {FacetOptions} from '../../../../controllers';

export type FacetOptionalParameters = Required<
  Pick<
    FacetOptions,
    'filterFacetCount' | 'injectionDepth' | 'numberOfValues' | 'sortCriteria'
  >
>;
