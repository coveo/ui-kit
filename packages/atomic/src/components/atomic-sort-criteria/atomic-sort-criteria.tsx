import {Schema, StringValue} from '@coveo/bueno';
import {Component, Prop, Element, h} from '@stencil/core';

/**
 * Component that defines a sort criteria.
 * Has to be used inside an `atomic-sort-dropdown` component.
 */
@Component({
  tag: 'atomic-sort-criteria',
  shadow: false,
})
export class AtomicSortCriteria {
  @Element() public host!: HTMLElement;

  @Prop({mutable: true}) public error?: Error;

  /**
   * The non-localized caption to display for this criteria.
   */
  @Prop() public caption!: string;

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
  @Prop() public criteria!: string;

  constructor() {
    try {
      new Schema({
        caption: new StringValue({emptyAllowed: false, required: true}),
        criteria: new StringValue({emptyAllowed: false, required: true}),
      }).validate({caption: this.caption, criteria: this.criteria});
    } catch (error) {
      this.error = error;
    }
  }

  public render() {
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
