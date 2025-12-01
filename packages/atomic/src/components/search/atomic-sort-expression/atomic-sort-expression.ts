import {ArrayValue, Schema, StringValue} from '@coveo/bueno';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import {arrayConverter} from '@/src/converters/array-converter';
import {LightDomMixin} from '@/src/mixins/light-dom';
import '@/src/components/common/atomic-component-error/atomic-component-error';

/**
 * The `atomic-sort-expression` component defines a sort expression. This component must be inside an `atomic-sort-dropdown` component.
 */
@customElement('atomic-sort-expression')
export class AtomicSortExpression extends LightDomMixin(LitElement) {
  /**
   * The non-localized label to display for this expression.
   */
  @property({type: String, reflect: true}) public label!: string;

  /**
   * One or more sort criteria that the end user can select or toggle between.
   *
   * The available sort criteria are:
   *
   * * `relevancy`
   * * `date ascending`/`date descending`
   * * `qre`
   * * `<FIELD> ascending`/`<FIELD> descending`, where you replace `<FIELD>` with the name of a sortable field in your index (`criteria="size ascending"`).
   *
   * You can specify multiple sort criteria to be used in the same request by separating them with a comma (`criteria="size ascending, date ascending"`).
   *
   * You can specify a list of comma-separated sort criteria which will be applied sequentially. For example, if there's a tie on the 1st criterion, the API uses the 2nd criterion to break the tie. However, this only works when combining:
   * * a relevancy criterion followed by one or more field or date criteria.
   * * a qre criterion followed by one or more field or date criteria.
   * * two or more field criteria (`<FIELD>` descending, `<FIELD>` descending).
   * * a single date criterion and one or more field criteria in any order (`<FIELD>` descending, date ascending).
   *
   * Examples:
   * * `relevancy`, `<FIELD> descending`
   * * `qre`, `<FIELD> ascending`
   * * `date descending`, `<FIELD> descending`, `<FIELD> ascending`
   */
  @property({type: String, reflect: true}) public expression!: string;

  /**
   * The tabs on which the sort expression can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-sort-expression tabs-included='["tabIDA", "tabIDB"]'></atomic-sort-expression>
   * ```
   * If you don't set this property, the sort expression can be displayed on any tab. Otherwise, the sort expression can only be displayed on the specified tabs.
   */
  @property({
    type: Array,
    reflect: true,
    converter: arrayConverter,
    attribute: 'tabs-included',
  })
  public tabsIncluded: string[] = [];

  /**
   * The tabs on which the sort expression must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-sort-expression tabs-excluded='["tabIDA", "tabIDB"]'></atomic-sort-expression>
   * ```
   * If you don't set this property, the sort expression can be displayed on any tab. Otherwise, the sort expression won't be displayed on any of the specified tabs.
   */
  @property({
    type: Array,
    reflect: true,
    converter: arrayConverter,
    attribute: 'tabs-excluded',
  })
  public tabsExcluded: string[] = [];

  @state() public error!: Error;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        label: this.label,
        expression: this.expression,
        tabsExcluded: this.tabsExcluded,
      }),
      new Schema({
        label: new StringValue({required: true, emptyAllowed: false}),
        expression: new StringValue({required: true, emptyAllowed: false}),
        tabsExcluded: new ArrayValue({
          each: new StringValue({}),
          required: false,
        }),
      }),
      // TODO V4: KIT-5197 - Remove false
      false
    );
  }

  render() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    }

    const dropdownComponent = 'atomic-sort-dropdown';

    if (!this.closest(dropdownComponent)) {
      const error = new Error(
        `The "${this.nodeName.toLowerCase()}" component has to be used inside an ${dropdownComponent} element.`
      );
      return html`<atomic-component-error
        .element=${this}
        .error=${error}
      ></atomic-component-error>`;
    }

    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-sort-expression': AtomicSortExpression;
  }
}
