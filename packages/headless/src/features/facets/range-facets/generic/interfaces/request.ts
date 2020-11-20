import {
  BaseFacetRequest,
  SortCriteria,
  BaseFacetValueRequest,
} from '../../../facet-api/request';

export const rangeFacetSortCriteria = ['ascending', 'descending'] as const;
export type RangeFacetSortCriterion = typeof rangeFacetSortCriteria[number];

export interface AutomaticRanges<T extends boolean> {
  generateAutomaticRanges: T;
}

export interface RangeRequest<T extends string | number>
  extends BaseFacetValueRequest {
  start: T;
  end: T;
  endInclusive: boolean;
}

export interface BaseRangeFacetRequest
  extends BaseFacetRequest,
    AutomaticRanges<boolean>,
    SortCriteria<RangeFacetSortCriterion> {}
