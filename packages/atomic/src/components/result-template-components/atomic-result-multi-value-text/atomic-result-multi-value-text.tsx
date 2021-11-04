import {Component, Element, Prop, h, State, VNode} from '@stencil/core';
import {
  BreadcrumbManager,
  buildBreadcrumbManager,
  Result,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {ResultContext} from '../../result-template-components/result-template-decorators';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {
  Bindings,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {titleToKebab} from '../../../utils/utils';

const listItemClasses = 'inline-block';

/**
 * The `atomic-result-multi-value-text` component renders the values of a multi-value string field.
 * @part result-multi-value-text-separator - The separator to display between each of the field values.
 * @part result-multi-value-text-value - A field value.
 * @part result-multi-value-text-value-more - A label indicating some values were omitted.
 * @slot result-multi-value-text-value-* - Lets you specify a custom caption value for a given part of a mutli-text field value. (e.g., if you want to use `Off-Campus Resident` as a caption value for `Off-campus apartment` in `Off-campus apartment;On-campus apartment`, you'd use  `<span slot="result-multi-value-text-value-off-campus-apartment">Off-Campus Resident</span>`). The suffix of this slot corresponds with the lowercase field value with all spaces replaced with hyphens.
 */
@Component({
  tag: 'atomic-result-multi-value-text',
  styleUrl: 'atomic-result-multi-value-text.pcss',
  shadow: true,
})
export class AtomicResultMultiText {
  public breadcrumbManager!: BreadcrumbManager;

  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The field that the component should use.
   * The component will try to find this field in the `Result.raw` object unless it finds it in the `Result` object first.
   * Make sure this field is present in the `fieldsToInclude` property of the `atomic-result-list` component.
   */
  @Prop() public field!: string;

  /**
   * The maximum number of field values to display.
   * If there are _n_ more values than the specified maximum, the last displayed value will be "_n_ more...".
   */
  @Prop() public maxValuesToDisplay = 3;

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
      return value.map((v) => `${v}`);
    }

    if (typeof value !== 'string' || value.trim() === '') {
      this.error = new Error(
        `Could not parse "${value}" from field "${this.field}" as a string array.`
      );
      return null;
    }

    return [value];
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
    if (values.length <= this.maxValuesToDisplay) {
      return values.length;
    }
    if (this.maxValuesToDisplay < 2) {
      return this.maxValuesToDisplay;
    }
    return Math.min(values.length - 2, this.maxValuesToDisplay);
  }

  private renderValue(value: string) {
    const label = getFieldValueCaption(this.field, value, this.bindings.i18n);
    const kebabValue = titleToKebab(value);
    return (
      <li
        key={value}
        part="result-multi-value-text-value"
        class={listItemClasses}
      >
        <slot name={`result-multi-value-text-value-${kebabValue}`}>
          {label}
        </slot>
      </li>
    );
  }

  private renderSeparator(beforeValue: string, afterValue: string) {
    return (
      <li
        role="separator"
        part="result-multi-value-text-separator"
        key={`${beforeValue}~${afterValue}`}
        class={`separator ${listItemClasses}`}
      ></li>
    );
  }

  private renderMoreLabel(value: number) {
    return (
      <li
        key="more-field-values"
        part="result-multi-value-text-value-more"
        class={listItemClasses}
      >
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
      <ul class="flex list-none">
        {...this.renderListItems(this.sortedValues)}
      </ul>
    );
  }
}
