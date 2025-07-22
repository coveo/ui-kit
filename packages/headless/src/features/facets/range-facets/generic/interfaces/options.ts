import type {RangeFacetRequest} from './range-facet.js';
import type {AutomaticRanges} from './request.js';

type RangeFacetRequiredParameters = Pick<
  RangeFacetRequest,
  'facetId' | 'field'
>;

export type RangeFacetOptionalParameters = Pick<
  RangeFacetRequest,
  | 'filterFacetCount'
  | 'injectionDepth'
  | 'numberOfValues'
  | 'sortCriteria'
  | 'rangeAlgorithm'
  | 'resultsMustMatch'
>;

export type AutomaticRangeFacetOptions<T extends RangeFacetRequest> =
  RangeFacetRequiredParameters &
    Partial<Pick<T, 'currentValues'>> &
    AutomaticRanges<true> &
    Partial<RangeFacetOptionalParameters>;
