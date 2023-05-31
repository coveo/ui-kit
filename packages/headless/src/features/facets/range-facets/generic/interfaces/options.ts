import {RangeFacetRequest} from './range-facet';
import {AutomaticRanges} from './request';

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
