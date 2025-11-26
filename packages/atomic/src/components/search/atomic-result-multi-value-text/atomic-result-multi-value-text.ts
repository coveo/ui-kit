import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {
  type BreadcrumbManager,
  buildBreadcrumbManager,
  type Result,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {when} from 'lit/directives/when.js';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import {titleToKebab} from '@/src/utils/utils';

/**
 * The `atomic-result-multi-value-text` component renders the values of a multi-value string field.
 * @part result-multi-value-text-list - The list of field values.
 * @part result-multi-value-text-separator - The separator to display between each of the field values.
 * @part result-multi-value-text-value - A field value.
 * @part result-multi-value-text-value-more - A label indicating some values were omitted.
 * @slot result-multi-value-text-value-* - A custom caption value that's specified for a given part of a multi-text field value. For example, if you want to use `Off-Campus Resident` as a caption value for `Off-campus apartment` in `Off-campus apartment;On-campus apartment`, you'd use `<span slot="result-multi-value-text-value-off-campus-apartment">Off-Campus Resident</span>`). The suffix of this slot corresponds with the field value, written in kebab case.
 */
@customElement('atomic-result-multi-value-text')
@bindings()
@withTailwindStyles
export class AtomicResultMultiValueText
  extends LitElement
  implements InitializableComponent<Bindings>
{
  public breadcrumbManager!: BreadcrumbManager;

  /**
   * The field that the component should use.
   * The component will try to find this field in the `Result.raw` object unless it finds it in the `Result` object first.
   * Make sure this field is present in the `fieldsToInclude` property of the `atomic-search-interface` component.
   */
  @property({type: String, reflect: true}) public field!: string;

  /**
   * The maximum number of field values to display.
   * If there are _n_ more values than the specified maximum, the last displayed value will be "_n_ more...".
   */
  @property({type: Number, reflect: true, attribute: 'max-values-to-display'})
  public maxValuesToDisplay = 3;

  /**
   * The delimiter used to separate values when the field isn't indexed as a multi value field.
   */
  @property({type: String, reflect: true}) public delimiter: string | null =
    null;

  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @state() private sortedValues: string[] | null = null;

  private resultContext = createResultContextController(this);

  private get result(): Result {
    return this.resultContext.item as Result;
  }

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        field: this.field,
        maxValuesToDisplay: this.maxValuesToDisplay,
      }),
      new Schema({
        field: new StringValue({required: true, emptyAllowed: false}),
        maxValuesToDisplay: new NumberValue({min: 0, required: false}),
      })
    );
  }

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
  }

  private get resultValues() {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );

    if (value === null) {
      return null;
    }

    if (Array.isArray(value)) {
      return value.map((v) => `${v}`.trim());
    }

    if (typeof value !== 'string' || value.trim() === '') {
      this.error = new Error(
        `Could not parse "${value}" from field "${this.field}" as a string array.`
      );
      return null;
    }

    return this.delimiter
      ? value.split(this.delimiter).map((value) => value.trim())
      : [value];
  }

  private get facetSelectedValues() {
    const values: string[] = [];
    if (!this.breadcrumbManager) {
      return values;
    }
    this.breadcrumbManager.state.facetBreadcrumbs
      .filter((facet) => facet.field === this.field)
      .forEach((facet) => {
        values.push(...facet.values.map(({value}) => value.value));
      });
    return values;
  }

  private updateSortedValues() {
    const allValues = this.resultValues;
    if (allValues === null) {
      this.sortedValues = null;
      return;
    }
    const allValuesSet = new Set(allValues);
    const firstValues = this.facetSelectedValues.filter((value) =>
      allValuesSet.has(value)
    );
    this.sortedValues = Array.from(
      allValues.reduce((set, value) => set.add(value), new Set(firstValues))
    );
  }

  private getShouldDisplayLabel(values: string[]) {
    return (
      this.maxValuesToDisplay > 0 && values.length > this.maxValuesToDisplay
    );
  }

  private getNumberOfValuesToDisplay(values: string[]) {
    return Math.min(values.length, this.maxValuesToDisplay);
  }

  private renderValue(value: string) {
    const label = getFieldValueCaption(this.field, value, this.bindings.i18n);
    const kebabValue = titleToKebab(value);
    return keyed(
      value,
      html`
        <li part="result-multi-value-text-value">
          <slot name=${`result-multi-value-text-value-${kebabValue}`}>
            ${label}
          </slot>
        </li>
      `
    );
  }

  private renderSeparator() {
    return html`
      <li
        aria-hidden="true"
        part="result-multi-value-text-separator"
               class="${String.raw`inline-block before:inline before:content-[',\00a0']`}"
      ></li>
    `;
  }

  private renderMoreLabel(value: number) {
    return html`
      <li  part="result-multi-value-text-value-more">
        ${this.bindings.i18n.t('n-more', {value})}
      </li>
    `;
  }

  private renderListItems(values: string[]) {
    const numberOfValuesToDisplay = this.getNumberOfValuesToDisplay(values);

    const nodes = [];
    for (let i = 0; i < numberOfValuesToDisplay; i++) {
      if (i > 0) {
        nodes.push(this.renderSeparator());
      }
      nodes.push(this.renderValue(values[i]));
    }
    if (this.getShouldDisplayLabel(values)) {
      nodes.push(this.renderSeparator());
      nodes.push(this.renderMoreLabel(values.length - numberOfValuesToDisplay));
    }
    return nodes;
  }

  willUpdate() {
    this.updateSortedValues();
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(
      this.sortedValues,
      () => html`
        <ul part="result-multi-value-text-list" class="m-0 flex list-none p-0">
          ${this.renderListItems(this.sortedValues!)}
        </ul>
      `
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-multi-value-text': AtomicResultMultiValueText;
  }
}
