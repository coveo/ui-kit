import {Component, Prop, h, State, VNode} from '@stencil/core';
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
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {titleToKebab} from '../../../utils/utils';

const listItemClasses = 'inline-block';

/**
 * The `atomic-result-multi-value-text` component renders the values of a multi-value string field.
 * @part result-multi-value-text-separator - The separator to display between each of the field values.
 * @part result-multi-value-text-value - A field value.
 * @slot result-multi-value-text-value-* - Lets you specify a custom caption value for a given part of a mutli-text field value. (e.g., if you want to use `Sweet!` as a caption value for `sweet` in `salty;sweet;sour`, you'd use  `<span slot="result-multi-value-text-value-sweet">Sweet!</span>`).
 */
@Component({
  tag: 'atomic-result-multi-value-text',
  styleUrl: 'atomic-result-multi-value-text.pcss',
  shadow: true,
})
export class AtomicResultMultiText implements InitializableComponent {
  public breadcrumbManager!: BreadcrumbManager;

  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

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

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
  }

  private get resultValues() {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );

    if (Array.isArray(value)) {
      return value.map((v) => `${v}`);
    }

    if (typeof value !== 'string' || value.trim() === '') {
      return [];
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

  private getSortedValues() {
    const allValues = this.resultValues;
    const allValuesSet = new Set(this.resultValues);
    const firstValues = this.facetSelectedValues.filter((value) =>
      allValuesSet.has(value)
    );
    return Array.from(
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
      <li key="more-field-values" class={listItemClasses}>
        {this.bindings.i18n.t('n-more', {value})}
      </li>
    );
  }

  private renderListItems() {
    const sortedValues = this.getSortedValues();
    const numberOfValuesToDisplay =
      this.getNumberOfValuesToDisplay(sortedValues);

    const nodes: VNode[] = [];
    for (let i = 0; i < numberOfValuesToDisplay; i++) {
      if (i > 0) {
        nodes.push(this.renderSeparator(sortedValues[i - 1], sortedValues[i]));
      }
      nodes.push(this.renderValue(sortedValues[i]));
    }
    if (this.getShouldDisplayLabel(sortedValues)) {
      nodes.push(
        this.renderSeparator(
          sortedValues[numberOfValuesToDisplay - 1],
          'more-field-values'
        )
      );
      nodes.push(
        this.renderMoreLabel(sortedValues.length - numberOfValuesToDisplay)
      );
    }
    return nodes;
  }

  public render() {
    return <ul class="flex list-none">{...this.renderListItems()}</ul>;
  }
}
