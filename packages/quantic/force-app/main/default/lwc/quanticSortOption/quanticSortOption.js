import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").SortCriterion} SortCriterion */

/**
 * The `QuanticSortOption` component defines a sort option for a `c-quantic-sort` component.
 * It must therefore be defined within a `c-quantic-sort` component.
 *
 * A sort option is a criterion that the end user can select to sort the query results.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-sort-option></c-quantic-sort-option>
 */
export default class QuanticSortOption extends LightningElement {
  /**
   * The label of the sort option.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The value of the sort option.
   * @api
   * @type {string}
   */
  @api value;
  /**
   * The criterion to use when sorting query results.
   * @api
   * @type {SortCriterion}
   */
  @api criterion;
}
