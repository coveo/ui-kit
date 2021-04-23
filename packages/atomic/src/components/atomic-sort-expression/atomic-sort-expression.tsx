import {Component, Prop, Element, h} from '@stencil/core';

/**
 * The `atomic-sort-expression` component defines a sort expression. This component must be inside an `atomic-sort-dropdown` component.
 */
@Component({
  tag: 'atomic-sort-expression',
  shadow: false,
})
export class AtomicSortExpression {
  @Element() public host!: HTMLElement;

  /**
   * The non-localized caption to display for this expression.
   */
  @Prop() public caption!: string;

  /**
   * The sort criterion/criteria expression the end user can select/toggle between.
   *
   * The available sort criteria are:
   * - `relevancy`
   * - `date ascending`/`date descending`
   * - `qre`
   * - `field ascending`/`field descending`, where you must replace `field` with the name of a sortable field in your index (e.g., `criteria="size ascending"`).
   *
   * You can specify multiple sort criteria to be used in the same request by separating them with a comma (e.g., `criteria="size ascending, date ascending"` ).
   */
  @Prop() public expression!: string;

  public render() {
    const dropdownComponent = 'atomic-sort-dropdown';
    if (!this.host.closest(dropdownComponent)) {
      const error = new Error(
        `The "${this.host.nodeName.toLowerCase()}" component has to be used inside an ${dropdownComponent} element.`
      );
      return (
        <atomic-component-error
          element={this.host}
          error={error}
        ></atomic-component-error>
      );
    }
  }
}
