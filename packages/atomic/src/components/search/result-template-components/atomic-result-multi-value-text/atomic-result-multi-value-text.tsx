import {
  BreadcrumbManager,
  buildBreadcrumbManager,
  Result,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {Component, Element, Prop, h, State, VNode} from '@stencil/core';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {titleToKebab} from '../../../../utils/utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';

/**
 * The `atomic-result-multi-value-text` component renders the values of a multi-value string field.
 * @part result-multi-value-text-list - The list of field values.
 * @part result-multi-value-text-separator - The separator to display between each of the field values.
 * @part result-multi-value-text-value - A field value.
 * @part result-multi-value-text-value-more - A label indicating some values were omitted.
 * @slot result-multi-value-text-value-* - A custom caption value that's specified for a given part of a multi-text field value. For example, if you want to use `Off-Campus Resident` as a caption value for `Off-campus apartment` in `Off-campus apartment;On-campus apartment`, you'd use `<span slot="result-multi-value-text-value-off-campus-apartment">Off-Campus Resident</span>`). The suffix of this slot corresponds with the field value, written in kebab case.
 */
@Component({
  tag: 'atomic-result-multi-value-text',
  styleUrl: 'atomic-result-multi-value-text.pcss',
  shadow: true,
})
export class AtomicResultMultiValueText {
  public breadcrumbManager!: BreadcrumbManager;

  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The field that the component should use.
   * The component will try to find this field in the `Result.raw` object unless it finds it in the `Result` object first.
   * Make sure this field is present in the `fieldsToInclude` property of the `atomic-search-interface` component.
   */
  @Prop({reflect: true}) public field!: string;

  /**
   * The maximum number of field values to display.
   * If there are _n_ more values than the specified maximum, the last displayed value will be "_n_ more...".
   */
  @Prop({reflect: true}) public maxValuesToDisplay = 3;

  /**
   * The delimiter used to separate values when the field isn't indexed as a multi value field.
   */
  @Prop({reflect: true}) public delimiter: string | null = null;

  private sortedValues: string[] | null = null;

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
    return this.breadcrumbManager.state.facetBreadcrumbs
      .filter((facet) => facet.field === this.field)
      .reduce(
        (values, facet) => [
          ...values,
          ...facet.values.map(({value}) => value.value),
        ],
        [] as string[]
      );
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
    return (
      <li key={value} part="result-multi-value-text-value">
        <slot name={`result-multi-value-text-value-${kebabValue}`}>
          {label}
        </slot>
      </li>
    );
  }

  private renderSeparator(beforeValue: string, afterValue: string) {
    return (
      <li
        aria-hidden="true"
        part="result-multi-value-text-separator"
        key={`${beforeValue}~${afterValue}`}
        class="separator"
      ></li>
    );
  }

  private renderMoreLabel(value: number) {
    return (
      <li key="more-field-values" part="result-multi-value-text-value-more">
        {this.bindings.i18n.t('n-more', {value})}
      </li>
    );
  }

  private renderListItems(values: string[]) {
    const numberOfValuesToDisplay = this.getNumberOfValuesToDisplay(values);

    const nodes: VNode[] = [];
    for (let i = 0; i < numberOfValuesToDisplay; i++) {
      if (i > 0) {
        nodes.push(this.renderSeparator(values[i - 1], values[i]));
      }
      nodes.push(this.renderValue(values[i]));
    }
    if (this.getShouldDisplayLabel(values)) {
      nodes.push(
        this.renderSeparator(
          values[numberOfValuesToDisplay - 1],
          'more-field-values'
        )
      );
      nodes.push(this.renderMoreLabel(values.length - numberOfValuesToDisplay));
    }
    return nodes;
  }

  public componentWillRender() {
    this.updateSortedValues();
  }

  public render() {
    if (this.sortedValues === null) {
      this.host.remove();
      return;
    }
    return (
      <ul part="result-multi-value-text-list">
        {...this.renderListItems(this.sortedValues)}
      </ul>
    );
  }
}
