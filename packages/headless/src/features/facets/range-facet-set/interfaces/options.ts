import {RangeFacetRequest, AutomaticRanges} from './request';

type RangeFacetRequiredParameters = Pick<
  RangeFacetRequest,
  'facetId' | 'field' | 'type'
>;

type RangeFacetOptionalParameters = Partial<
  Pick<
    RangeFacetRequest,
    'filterFacetCount' | 'injectionDepth' | 'numberOfValues' | 'sortCriteria'
  >
>;

type ManualRangeFacetOptions = RangeFacetRequiredParameters &
  Pick<RangeFacetRequest, 'currentValues'> &
  AutomaticRanges<false> &
  RangeFacetOptionalParameters;

type AutomaticRangeFacetOptions = RangeFacetRequiredParameters &
  Partial<Pick<RangeFacetRequest, 'currentValues'>> &
  AutomaticRanges<true> &
  RangeFacetOptionalParameters;

export type RangeFacetRegistrationOptions =
  | ManualRangeFacetOptions
  | AutomaticRangeFacetOptions;
