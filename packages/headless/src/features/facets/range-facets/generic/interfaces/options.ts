import {RangeFacetRequest} from './range-facet.js';
import {AutomaticRanges} from './request.js';

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

export type ManualRangeFacetOptions<T extends RangeFacetRequest> =
  RangeFacetRequiredParameters &
    Pick<T, 'currentValues'> &
    AutomaticRanges<false> &
    Partial<RangeFacetOptionalParameters>;

export type AutomaticRangeFacetOptions<T extends RangeFacetRequest> =
  RangeFacetRequiredParameters &
    Partial<Pick<T, 'currentValues'>> &
    AutomaticRanges<true> &
    Partial<RangeFacetOptionalParameters>;
