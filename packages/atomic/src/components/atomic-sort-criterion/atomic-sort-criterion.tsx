import {
  SortCriterion,
  SortBy,
  SortOrder,
  validateSortCriterion,
} from '@coveo/headless';
import {Component, Prop, State, h, Element} from '@stencil/core';

/**
 * Component that defines a sort criterion.
 * Has to be used inside an `atomic-sort-dropdown` component.
 */
@Component({
  tag: 'atomic-sort-criterion',
  shadow: true,
})
export class AtomicSortCriterion {
  @Element() host!: HTMLElement;
  /**
   * The available criteria that can be used to sort query results.
   *
   * - `relevancy`: Uses standard index ranking factors (adjacency, TDIDF) and custom ranking expressions (QREs and QRFs) to compute a ranking score for each query result item, and sorts the query results by descending score value.
   * - `qre`: Uses only custom ranking expressions (QREs and QRFs) to compute a ranking score for each query result item, and sorts the query results by descending score value.
   * - `date`: Uses the date field to sort the query results. This field typically contains the last modification date of each item. May be in ascending or descending order.
   * - `field`: Uses the value of a specific sortable field to sort the query results. May be in ascending or descending order.
   */
  @Prop({reflect: true}) by!: SortBy;

  /**
   * The available sort orders: `ascending` or `descending`/
   */
  @Prop({reflect: true}) order?: SortOrder;

  /**
   * The sortable field on which to sort when `by` is `field`.
   */
  @Prop({reflect: true}) field?: string;

  /**
   * The non-localized caption to display for this criteria.
   */
  @Prop({mutable: true, reflect: true}) caption!: string;

  /**
   * Validated sort criterion. `null` when invalid.
   * For development purposes, not meant to be specified by users.
   */
  @Prop({mutable: true}) criterion!: SortCriterion;

  @State() private error?: Error;

  constructor() {
    try {
      this.criterion = validateSortCriterion(this);
      if (!this.caption) {
        const order =
          'order' in this.criterion ? `_${this.criterion.order}` : '';
        this.caption = `${this.criterion.by}${order}`;
      }
    } catch (error) {
      this.error = error;
    }
  }

  render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
  }
}
