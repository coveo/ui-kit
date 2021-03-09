import {
  BaseFacetRequest,
  SortCriteria,
  BaseFacetValueRequest,
} from '../../../facet-api/request';

export const rangeFacetSortCriteria: RangeFacetSortCriterion[] = [
  'ascending',
  'descending',
];
export type RangeFacetSortCriterion = 'ascending' | 'descending';

export interface AutomaticRanges<T extends boolean> {
  /** Whether the index should automatically create range values.
   *
   * Tip: If you set this parameter to true, you should ensure that the Use cache for numeric queries option is enabled for the Facet field in your index in order to speed up automatic range evaluation (see [Add or Edit Fields](https://docs.coveo.com/en/1982/index-content/add-or-edit-a-field)).
   */
  generateAutomaticRanges: T;
}

export interface RangeRequest<T extends string | number>
  extends BaseFacetValueRequest {
  /** The start value of the range.*/
  start: T;
  /** The end value of the range.*/
  end: T;
  /** Whether to include the `end` value in the range.
   * @default false
   */
  endInclusive: boolean;
}

export interface BaseRangeFacetRequest
  extends BaseFacetRequest,
    AutomaticRanges<boolean>,
    SortCriteria<RangeFacetSortCriterion> {
  /** @default "ascending" */
  sortCriteria: RangeFacetSortCriterion;
}
