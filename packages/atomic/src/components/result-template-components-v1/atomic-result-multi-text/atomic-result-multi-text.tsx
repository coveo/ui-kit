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
 * The `atomic-result-multi-text` component renders the values of a multi-value string result field.
 * @part result-multi-text-separator - The separator between two field values.
 * @part result-multi-text-value - A field value.
 * @slot result-multi-text-value-* - Allows the personalization of a particular field value based on its indexed name.
 */
@Component({
  tag: 'atomic-result-multi-text',
  styleUrl: 'atomic-result-multi-text.pcss',
  shadow: true,
})
export class AtomicResultMultiText implements InitializableComponent {
  public breadcrumbManager!: BreadcrumbManager;

  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  @State() public error!: Error;

  /**
   * The result field which the component should use.
   * This will look in the Result object first, and then in the Result.raw object for the fields.
   * It is important to include the necessary field in the ResultList component.
   */
  @Prop() public field!: string;

  /**
   * If present, will attempt to split the field into multiple values using wherever this character is encountered.
   */
  @Prop() public delimitingCharacter?: string;

  /**
   * The maximum number of field values to display.
   * If there are more values than the maximum that was set here, the last value displayed will be "# more...".
   */
  @Prop() public maximumValues = 3;

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

    return this.delimitingCharacter
      ? value.split(this.delimitingCharacter)
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

  private renderValue(value: string) {
    const label = getFieldValueCaption(this.field, value, this.bindings.i18n);
    const kebabValue = titleToKebab(value);
    return (
      <li key={value} part="result-multi-text-value" class={listItemClasses}>
        <slot name={`result-multi-text-value-${kebabValue}`}>{label}</slot>
      </li>
    );
  }

  private renderSeparator(beforeValue: string, afterValue: string) {
    return (
      <li
        role="separator"
        part="result-multi-text-separator"
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
    const shouldDisplayLabel = sortedValues.length > this.maximumValues;
    const numberOfValuesToDisplay = shouldDisplayLabel
      ? this.maximumValues - 1
      : sortedValues.length;

    const nodes: VNode[] = [];
    for (let i = 0; i < numberOfValuesToDisplay; i++) {
      if (i > 0) {
        nodes.push(this.renderSeparator(sortedValues[i - 1], sortedValues[i]));
      }
      nodes.push(this.renderValue(sortedValues[i]));
    }
    if (shouldDisplayLabel) {
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
