import {
  BaseFacetRequest,
  CurrentValues,
  Freezable,
  Type,
  SortCriteria,
  BaseFacetValueRequest,
} from '../../facet-api/request';

export type RangeFacetSortCriterion = 'ascending' | 'descending';

export interface RangeFacetValueRequest extends BaseFacetValueRequest {
  start: string;
  end: string;
  endInclusive: boolean;
}

export interface AutomaticRanges<T extends boolean> {
  generateAutomaticRanges: T;
}

export interface RangeFacetRequest
  extends BaseFacetRequest,
    AutomaticRanges<boolean>,
    CurrentValues<RangeFacetRequest>,
    Freezable,
    Type<'dateRange' | 'numericalRange'>,
    SortCriteria<RangeFacetSortCriterion> {}
