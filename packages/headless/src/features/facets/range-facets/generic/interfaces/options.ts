import {AutomaticRanges} from './request';
import {RangeFacetRequest} from './range-facet';

type RangeFacetRequiredParameters = Pick<
  RangeFacetRequest,
  'facetId' | 'field'
>;

export type RangeFacetOptionalParameters = Pick<
  RangeFacetRequest,
  'filterFacetCount' | 'injectionDepth' | 'numberOfValues' | 'sortCriteria'
>;

export type ManualRangeFacetOptions<
  T extends RangeFacetRequest
> = RangeFacetRequiredParameters &
  Pick<T, 'currentValues'> &
  AutomaticRanges<false> &
  Partial<RangeFacetOptionalParameters>;

export type AutomaticRangeFacetOptions<
  T extends RangeFacetRequest
> = RangeFacetRequiredParameters &
  Partial<Pick<T, 'currentValues'>> &
  AutomaticRanges<true> &
  Partial<RangeFacetOptionalParameters>;
