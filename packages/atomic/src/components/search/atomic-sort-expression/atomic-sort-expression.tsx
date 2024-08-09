import {Component, Prop, Element, h} from '@stencil/core';
import {ArrayProp} from '../../../utils/props-utils';

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
   * The non-localized label to display for this expression.
   */
  @Prop({reflect: true}) public label!: string;

  /**
   * One or more sort criteria that the end user can select or toggle between.
   *
   * The available sort criteria are:
   *
   * * `relevancy`
   * * `date ascending`/`date descending`
   * * `qre`
   * * `<FIELD> ascending`/`<FIELD> descending`, where you replace `<FIELD>` with the name of a sortable field in your index (e.g., `criteria="size ascending"`).
   *
   * You can specify multiple sort criteria to be used in the same request by separating them with a comma (e.g., `criteria="size ascending, date ascending"`).
   */
  @Prop({reflect: true}) public expression!: string;
  /**
   * The tabs on which the sort expression can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, e.g.,
   * ```html
   *  <atomic-sort-expression tabs-included='["tabIDA", "tabIDB"]'></atomic-sort-expression snippet>
   * ```
   * If you don't set this property, the sort expression can be displayed on any tab. Otherwise, the sort expression can only be displayed on the specified tabs.
   */
  @ArrayProp()
  @Prop({reflect: true, mutable: true})
  public tabsIncluded: string[] | string = '[]';

  /**
   * The tabs on which the sort expression must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, e.g.,
   * ```html
   *  <atomic-sort-expression tabs-excluded='["tabIDA", "tabIDB"]'></atomic-sort-expression>
   * ```
   * If you don't set this property, the sort expression can be displayed on any tab. Otherwise, the sort expression won't be displayed on any of the specified tabs.
   */
  @ArrayProp()
  @Prop({reflect: true, mutable: true})
  public tabsExcluded: string[] | string = '[]';

  public render() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This is could lead to unexpected behaviors.'
      );
    }

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
