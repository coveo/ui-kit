import type {
  BaseFacetRequest,
  RangeAlgorithm,
  SortCriteria,
} from '../../../facet-api/request.js';

export const rangeFacetSortCriteria: RangeFacetSortCriterion[] = [
  'ascending',
  'descending',
];
/**
 * Whether the range algorithm proposes ranges based on an even split of the interval or equiprobable intervals that each contain the same amount of results.
 */
export const rangeFacetRangeAlgorithm: RangeFacetRangeAlgorithm[] = [
  'even',
  'equiprobable',
];

export type RangeFacetSortCriterion = 'ascending' | 'descending';
export type RangeFacetRangeAlgorithm = 'even' | 'equiprobable';

export interface AutomaticRanges<T extends boolean> {
  /** Whether the index should automatically create range values.
   *
   * Tip: If you set this parameter to true, ensure that the Use cache for numeric queries option is enabled for the Facet field in your index in order to speed up automatic range evaluation (see [Add or Edit Fields](https://docs.coveo.com/en/1982/index-content/add-or-edit-a-field)).
   */
  generateAutomaticRanges: T;
}

export interface BaseRangeFacetRequest
  extends BaseFacetRequest,
    AutomaticRanges<boolean>,
    SortCriteria<RangeFacetSortCriterion>,
    RangeAlgorithm<RangeFacetRangeAlgorithm> {
  /** @defaultValue `ascending` */
  sortCriteria: RangeFacetSortCriterion;
  /** @defaultValue `even` */
  rangeAlgorithm: RangeFacetRangeAlgorithm;
}
