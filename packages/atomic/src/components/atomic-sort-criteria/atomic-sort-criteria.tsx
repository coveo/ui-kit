import {Component, Prop, Element} from '@stencil/core';

/**
 * Component that defines a sort criteria.
 * Has to be used inside an `atomic-sort-dropdown` component.
 */
@Component({
  tag: 'atomic-sort-criteria',
  shadow: false,
})
export class AtomicSortCriteria {
  @Element() host!: HTMLElement;

  /**
   * The non-localized caption to display for this criteria.
   */
  @Prop({reflect: true}) caption!: string;

  /**
   * The sort criterion/criteria the end user can select/toggle between.
   *
   * The available sort criteria are:
   * - `relevancy`
   * - `date ascending`/`date descending`
   * - `qre`
   * - `field ascending`/`field descending`, where you must replace `field` with the name of a sortable field in your index (e.g., `criteria="size ascending"`).
   *
   * You can specify multiple sort criteria to be used in the same request by separating them with a comma (e.g., `criteria="size ascending, date ascending"` ).
   */
  @Prop({reflect: true}) criteria!: string;
}
