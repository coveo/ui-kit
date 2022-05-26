import {Component, h, State, Prop, VNode, Element, Listen} from '@stencil/core';
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
  buildFacetConditionsManager,
  FacetConditionsManager,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetPlaceholder} from '../atomic-facet-placeholder/atomic-facet-placeholder';
import {FacetContainer} from '../facet-container/facet-container';
import {FacetHeader} from '../facet-header/facet-header';
import {FacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {BaseFacet, parseDependsOn, validateDependsOn} from '../facet-common';
import {
  defaultNumberFormatter,
  NumberFormatter,
} from '../../formats/format-common';
import {NumberInputType} from '../facet-number-input/number-input-type';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {Schema, StringValue} from '@coveo/bueno';
import {registerFacetToStore} from '../../../utils/store';
import {Hidden} from '../../common/hidden';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../utils/accessibility-utils';
import {MapProp} from '../../../utils/props-utils';

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
 * @part input-start - The input for the starting value of the custom numeric range.
 * @part input-end - The input for the ending value of the custom numeric range.
 * @part input-apply-button - The apply button for the custom range.
 *
 * @part ripple - The ripple effect of the component's interactive elements.
 */
@Component({
  tag: 'atomic-numeric-facet',
  styleUrl: 'atomic-numeric-facet.pcss',
  shadow: true,
})
export class AtomicNumericFacet
  implements InitializableComponent, BaseFacet<NumericFacet>
{
  @InitializeBindings() public bindings!: Bindings;
  public facet?: NumericFacet;
  private dependenciesManager?: FacetConditionsManager;
  public filter?: NumericFilter;
  public searchStatus!: SearchStatus;
  @Element() private host!: HTMLElement;
  private manualRanges: NumericRangeWithLabel[] = [];
  private formatter: NumberFormatter = defaultNumberFormatter;

  @BindStateToController('facet')
  @State()
  public facetState!: NumericFacetState;
  @BindStateToController('filter')
  @State()
  public filterState?: NumericFilterState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The non-localized label for the facet.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @Prop({reflect: true}) public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * The number of values to request for this facet, when there are no manual ranges.
   * If the number of values is 0, no ranges will be displayed.
   */
  @Prop({reflect: true}) public numberOfValues = 8;
  /**
   * Whether this facet should contain an input allowing users to set custom ranges.
   * Depending on the field, the input can allow either decimal or integer values.
   */
  @Prop({reflect: true}) public withInput?: NumberInputType;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'ascending' and 'descending'.
   */
  @Prop({reflect: true}) public sortCriteria: RangeFacetSortCriterion =
    'ascending';
  /**
   * The algorithm that's used for generating the ranges of this facet when they aren't manually defined. The default value of `"equiprobable"` generates facet ranges which vary in size but have a more balanced number of results within each range. The value of `"even"` generates equally sized facet ranges across all of the results.
   */
  @Prop({reflect: true}) public rangeAlgorithm: RangeFacetRangeAlgorithm =
    'equiprobable';
  /**
   * Whether to display the facet values as checkboxes (multiple selection) or links (single selection).
   * Possible values are 'checkbox' and 'link'.
   */
  @Prop({reflect: true}) public displayValuesAs: 'checkbox' | 'link' =
    'checkbox';
  /**
   * Specifies if the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading over the facet, from 1 to 6.
   */
  @Prop({reflect: true}) public headingLevel = 0;
  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   */
  @Prop({reflect: true}) public filterFacetCount = true;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @Prop({reflect: true}) public injectionDepth = 1000;

  /**
   * The required facets and values for this facet to be displayed.
   * Examples:
   * ```html
   * <atomic-facet facet-id="abc" field="objecttype" ...></atomic-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-numeric-facet
   *   depends-on-abc
   *   ...
   * ></atomic-numeric-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-numeric-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-numeric-facet>
   * ```
   */
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  @FocusTarget()
  private headerFocus!: FocusTargetController;

  private validateProps() {
    new Schema({
      displayValuesAs: new StringValue({constrainTo: ['checkbox', 'link']}),
      withInput: new StringValue({constrainTo: ['integer', 'decimal']}),
    }).validate({
      displayValuesAs: this.displayValuesAs,
      withInput: this.withInput,
    });
    validateDependsOn(this.dependsOn);
  }

  public initialize() {
    this.validateProps();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.numberOfValues && this.initializeFacet();
    this.withInput && this.initializeFilter();
    this.inititalizeDependenciesManager();
    this.registerFacetToStore();
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
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
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
    };
    this.facet = buildNumericFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
  }

  private initializeFilter() {
    this.filter = buildNumericFilter(this.bindings.engine, {
      options: {
        facetId: this.facetId ? `${this.facetId}_input` : undefined,
        field: this.field,
      },
    });

    if (!this.facetId) {
      this.facetId = this.filter.state.facetId;
    }
  }

  private registerFacetToStore() {
    registerFacetToStore(this.bindings.store, 'numericFacets', {
      label: this.label,
      facetId: this.facetId!,
      element: this.host,
      format: (value) => this.formatFacetValue(value),
    });

    if (this.filter) {
      this.bindings.store.state.numericFacets[this.filter.state.facetId] =
        this.bindings.store.state.numericFacets[this.facetId!];
    }
  }

  private inititalizeDependenciesManager() {
    this.dependenciesManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facet?.state.facetId ?? this.filter!.state.facetId,
        conditions: parseDependsOn(this.dependsOn),
      }
    );
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
      return this.formatter(value, this.bindings.i18n.languages as string[]);
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

  private get enabled() {
    return this.facetState?.enabled ?? this.filterState?.enabled ?? true;
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
          this.headerFocus.focusAfterSearch();
          if (this.filterState?.range) {
            this.filter?.clear();
            return;
          }
          this.facet?.deselectAll();
        }}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        headingLevel={this.headingLevel}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
        headerRef={this.headerFocus.setTarget}
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
      ? getFieldValueCaption(this.field, manualRangeLabel, this.bindings.i18n)
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
          >
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
            ></FacetValueLabelHighlight>
          </FacetValueCheckbox>
        );
      case 'link':
        return (
          <FacetValueLink
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
          >
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
            ></FacetValueLabelHighlight>
          </FacetValueLink>
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

  private get hasInputRange() {
    return !!this.filterState?.range;
  }

  private get shouldRenderValues() {
    return !this.hasInputRange && !!this.valuesToRender.length;
  }

  private get shouldRenderInput() {
    if (!this.withInput) {
      return false;
    }

    if (this.hasInputRange) {
      return true;
    }

    if (!this.searchStatusState.hasResults) {
      return false;
    }

    if (!this.valuesToRender.length && this.numberOfValues > 0) {
      return false;
    }

    return true;
  }

  public render() {
    if (this.searchStatusState.hasError || !this.enabled) {
      return <Hidden></Hidden>;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfValues}
          isCollapsed={this.isCollapsed}
        ></FacetPlaceholder>
      );
    }

    if (!this.shouldRenderFacet) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader()}
        {!this.isCollapsed && [
          this.shouldRenderValues && this.renderValues(),
          this.shouldRenderInput && this.renderNumberInput(),
        ]}
      </FacetContainer>
    );
  }
}
