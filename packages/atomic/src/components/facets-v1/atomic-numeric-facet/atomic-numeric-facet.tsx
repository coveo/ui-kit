import {
  Component,
  h,
  State,
  Prop,
  VNode,
  Element,
  Listen,
  Host,
} from '@stencil/core';
import {
  NumericFacet,
  buildNumericFacet,
  NumericFacetState,
  NumericFacetOptions,
  RangeFacetSortCriterion,
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  RangeFacetRangeAlgorithm,
  NumericFacetValue,
  buildNumericRange,
  NumericRangeRequest,
  buildNumericFilter,
  NumericFilterState,
  NumericFilter,
  loadNumericFacetSetActions,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetPlaceholder} from '../../facets/atomic-facet-placeholder/atomic-facet-placeholder';
import {FacetContainer} from '../facet-container/facet-container';
import {FacetHeader} from '../facet-header/facet-header';
import {FacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {BaseFacet} from '../facet-common';
import {
  defaultNumberFormatter,
  NumberFormatter,
} from '../../formats/format-common';
import {NumberInputType} from '../facet-number-input/number-input-type';

interface NumericRangeWithLabel extends NumericRangeRequest {
  label?: string;
}

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-numeric-facet` displays a facet of the results for the current query as numeric ranges.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part values - The facet values container.
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 *
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 * @part value-link - The facet value when display is 'link'.
 *
 * @part input-start - The input for the start value of the custom range.
 * @part input-end - The input for the end value of the custom range.
 * @part input-apply-button - The apply button for the custom range.
 */
@Component({
  tag: 'atomic-numeric-facet-v1', // TODO: remove v1 when old facets are removed
  styleUrl: 'atomic-numeric-facet.pcss',
  shadow: true,
})
export class AtomicNumericFacet
  implements
    InitializableComponent,
    BaseFacet<NumericFacet, NumericFacetState> {
  @InitializeBindings() public bindings!: Bindings;
  public facet?: NumericFacet;
  public filter?: NumericFilter;
  public searchStatus!: SearchStatus;
  @Element() private host!: HTMLElement;
  private manualRanges: NumericRangeWithLabel[] = [];
  private formatter: NumberFormatter = defaultNumberFormatter;

  @BindStateToController('facet')
  @State()
  public facetState?: NumericFacetState;
  @BindStateToController('filter')
  @State()
  public filterState?: NumericFilterState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;
  @State() public isCollapsed = false;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The non-localized label for the facet.
   */
  @Prop() public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop() public field!: string;
  /**
   * The number of values to request for this facet, when there are no manual ranges.
   * If the number of values is 0, no ranges will be displayed.
   */
  @Prop() public numberOfValues = 8;
  /**
   * Whether this facet should contain an input allowing users to set custom ranges.
   * Depending on the field, the input can allow either decimal or integer values.
   */
  @Prop() public withInput?: NumberInputType;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'ascending' and 'descending'.
   */
  @Prop() public sortCriteria: RangeFacetSortCriterion = 'ascending';
  /**
   * The algorithm that's used for generating the ranges of this facet when they aren't manually defined. The default value of `"equiprobable"` generates facet ranges which vary in size but have a more balanced number of results within each range. The value of `"even"` generates equally sized facet ranges across all of the results.
   */
  @Prop() public rangeAlgorithm: RangeFacetRangeAlgorithm = 'equiprobable';
  /**
   * Whether to display the facet values as checkboxes (multiple selection) or links (single selection).
   * Possible values are 'checkbox' and 'link'.
   */
  @Prop() public displayValuesAs: 'checkbox' | 'link' = 'checkbox';

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.numberOfValues && this.initializeFacet();
    this.withInput && this.initializeFilter();
  }

  private initializeFacet() {
    this.manualRanges = this.buildManualRanges();
    const options: NumericFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      rangeAlgorithm: this.rangeAlgorithm,
      currentValues: this.manualRanges,
      generateAutomaticRanges: !this.manualRanges.length,
    };
    this.facet = buildNumericFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    this.bindings.store.state.numericFacets[this.facetId] = {
      label: this.label,
      format: (facetValue) => this.formatFacetValue(facetValue),
    };
  }

  private initializeFilter() {
    this.filter = buildNumericFilter(this.bindings.engine, {
      options: {
        facetId: this.facetId ? `${this.facetId}_input` : undefined,
        field: this.field,
      },
    });
    this.bindings.store.state.numericFacets[
      this.filter.state.facetId
    ] = this.bindings.store.state.numericFacets[this.facetId!];
  }

  @Listen('atomic/numberFormat')
  public setFormat(event: CustomEvent<NumberFormatter>) {
    event.preventDefault();
    event.stopPropagation();
    this.formatter = event.detail;
  }

  @Listen('atomic/numberInputApply')
  public applyNumberInput() {
    this.facetId &&
      this.bindings.engine.dispatch(
        loadNumericFacetSetActions(
          this.bindings.engine
        ).deselectAllNumericFacetValues(this.facetId)
      );
  }

  private formatValue(value: number) {
    try {
      return this.formatter(value, this.bindings.i18n.languages);
    } catch (error) {
      this.bindings.engine.logger.error(
        `atomic-numeric-facet facet value "${value}" could not be formatted correctly.`,
        error
      );
      return value;
    }
  }

  private buildManualRanges(): NumericRangeWithLabel[] {
    return Array.from(this.host.querySelectorAll('atomic-numeric-range')).map(
      ({start, end, endInclusive, label}) => ({
        ...buildNumericRange({start, end, endInclusive}),
        label,
      })
    );
  }

  private get numberOfSelectedValues() {
    if (this.filterState?.range) {
      return 1;
    }

    return (
      this.facetState?.values.filter(({state}) => state === 'selected')
        .length || 0
    );
  }

  private renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => {
          if (this.filterState?.range) {
            this.filter?.clear();
            return;
          }
          this.facet?.deselectAll();
        }}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
      ></FacetHeader>
    );
  }

  private renderNumberInput() {
    return (
      <atomic-facet-number-input
        type={this.withInput!}
        bindings={this.bindings}
        label={this.label}
        filter={this.filter!}
        filterState={this.filterState!}
      ></atomic-facet-number-input>
    );
  }

  private areRangesEqual(
    firstRange: NumericRangeRequest,
    secondRange: NumericRangeRequest
  ) {
    return (
      firstRange.start === secondRange.start &&
      firstRange.end === secondRange.end &&
      firstRange.endInclusive === secondRange.endInclusive
    );
  }

  private formatFacetValue(facetValue: NumericFacetValue) {
    const manualRangeLabel = this.manualRanges.find((range) =>
      this.areRangesEqual(range, facetValue)
    )?.label;
    return manualRangeLabel
      ? this.bindings.i18n.t(manualRangeLabel)
      : this.bindings.i18n.t('to', {
          start: this.formatValue(facetValue.start),
          end: this.formatValue(facetValue.end),
        });
  }

  private renderValue(facetValue: NumericFacetValue, onClick: () => void) {
    const displayValue = this.formatFacetValue(facetValue);
    const isSelected = facetValue.state === 'selected';
    switch (this.displayValuesAs) {
      case 'checkbox':
        return (
          <FacetValueCheckbox
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
          ></FacetValueCheckbox>
        );
      case 'link':
        return (
          <FacetValueLink
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
          ></FacetValueLink>
        );
    }
  }

  private renderValuesContainer(children: VNode[]) {
    return (
      <ul part="values" class="mt-3">
        {children}
      </ul>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.valuesToRender.map((value) =>
        this.renderValue(value, () =>
          this.displayValuesAs === 'link'
            ? this.facet!.toggleSingleSelect(value)
            : this.facet!.toggleSelect(value)
        )
      )
    );
  }

  private get valuesToRender() {
    return (
      this.facetState?.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
  }

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get shouldRenderValues() {
    const hasInputRange = !!this.filterState?.range;
    return !hasInputRange && !!this.valuesToRender.length;
  }

  private get shouldRenderInput() {
    if (!this.withInput) {
      return false;
    }

    return this.searchStatusState.hasResults || !!this.filterState?.range;
  }

  public render() {
    if (this.searchStatusState.hasError) {
      return;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfValues}
        ></FacetPlaceholder>
      );
    }

    if (!this.shouldRenderFacet) {
      return <Host class="atomic-without-values"></Host>;
    }

    return (
      <Host class="atomic-with-values">
        <FacetContainer>
          {this.renderHeader()}
          {!this.isCollapsed && [
            this.shouldRenderInput && this.renderNumberInput(),
            this.shouldRenderValues && this.renderValues(),
          ]}
        </FacetContainer>
      </Host>
    );
  }
}
