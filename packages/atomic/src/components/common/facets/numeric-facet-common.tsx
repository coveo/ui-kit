import {Schema, StringValue} from '@coveo/bueno';
import {VNode, h} from '@stencil/core';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {NumberFormatter} from '../formats/format-common';
import {Hidden} from '../hidden';
import {AnyBindings} from '../interface/bindings';
import {
  FacetConditionsManager,
  NumericFacet,
  NumericFacetValue,
  NumericFilter,
  NumericRangeOptions,
  NumericRangeRequest,
  SearchStatusState,
} from '../types';
import {
  shouldDisplayInputForFacetRange,
  validateDependsOn,
} from './facet-common';
import {FacetContainer} from './facet-container/facet-container';
import {FacetHeader} from './facet-header/facet-header';
import {NumberInputType} from './facet-number-input/number-input-type';
import {FacetPlaceholder} from './facet-placeholder/facet-placeholder';
import {FacetValueCheckbox} from './facet-value-checkbox/facet-value-checkbox';
import {FacetValueLabelHighlight} from './facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from './facet-value-link/facet-value-link';
import {FacetValuesGroup} from './facet-values-group/facet-values-group';

export interface NumericRangeWithLabel extends NumericRangeRequest {
  label?: string;
}

export type NumericFacetDisplayValues = 'checkbox' | 'link';

interface NumericFacetCommonOptions {
  host: HTMLElement;
  bindings: AnyBindings;
  label: string;
  field: string;
  headingLevel: number;
  displayValuesAs: NumericFacetDisplayValues;
  dependsOn: Record<string, string>;
  withInput?: NumberInputType;
  numberOfValues: number;
  setFacetId(id: string): string;
  setManualRanges(
    manualRanges: NumericRangeWithLabel[]
  ): NumericRangeWithLabel[];
  getFormatter(): NumberFormatter;
  getSearchStatusState(): SearchStatusState;
  buildDependenciesManager(): FacetConditionsManager;
  buildNumericRange(config: NumericRangeOptions): NumericRangeRequest;
  initializeFacetForInput(): NumericFacet;
  initializeFacetForRange(): NumericFacet;
  initializeFilter(): NumericFilter;
}

interface NumericFacetCommonRenderProps {
  hasError: boolean;
  firstSearchExecuted: boolean;
  isCollapsed: boolean;
  headerFocus: FocusTargetController;
  onToggleCollapse: () => boolean;
}

export class NumericFacetCommon {
  private host: HTMLElement;
  private bindings: AnyBindings;
  private label: string;
  private field: string;
  private headingLevel: number;
  private filter?: NumericFilter;
  private dependsOn: Record<string, string>;
  private displayValuesAs: NumericFacetDisplayValues;
  private withInput?: NumberInputType;
  private numberOfValues: number;
  private facetId?: string;
  private manualRanges: NumericRangeWithLabel[] = [];
  private facetForRange?: NumericFacet;
  private facetForInput?: NumericFacet;
  private getFormatter: () => NumberFormatter;
  private getSearchStatusState: () => SearchStatusState;

  private dependenciesManager: FacetConditionsManager;

  constructor(props: NumericFacetCommonOptions) {
    this.host = props.host;
    this.bindings = props.bindings;
    this.label = props.label;
    this.field = props.field;
    this.headingLevel = props.headingLevel;
    this.dependsOn = props.dependsOn;
    this.displayValuesAs = props.displayValuesAs;
    this.withInput = props.withInput;
    this.numberOfValues = props.numberOfValues;
    this.getFormatter = props.getFormatter;
    this.getSearchStatusState = props.getSearchStatusState;
    this.validateProps();

    // Initialize two facets: One that is actually used to display values for end users, which only exists
    // if we need to display something to the end user (ie: numberOfValues > 0)

    // A second facet is initialized only to verify the results count. It is never used to display results to end user.
    // It serves as a way to determine if the input should be rendered or not, independent of the ranges (manual or automatic) configured in the component
    if (this.numberOfValues > 0) {
      this.manualRanges = props.setManualRanges(
        Array.from(this.host.querySelectorAll('atomic-numeric-range')).map(
          ({start, end, endInclusive, label}) => ({
            ...props.buildNumericRange({start, end, endInclusive}),
            label,
          })
        )
      );
      this.facetForRange = props.initializeFacetForRange();
      this.facetId = props.setFacetId(this.facetForRange.state.facetId);
    }
    if (this.withInput) {
      this.facetForInput = props.initializeFacetForInput();
      this.filter = props.initializeFilter();
      if (!this.facetId) {
        this.facetId = this.filter.state.facetId;
      }
    }
    this.dependenciesManager = props.buildDependenciesManager();
    this.registerFacetToStore();
  }

  private get formatter() {
    return this.getFormatter();
  }
  private get enabled() {
    return (
      this.facetForRange?.state.enabled ?? this.filter?.state.enabled ?? true
    );
  }

  private get numberOfSelectedValues() {
    if (this.filter?.state.range) {
      return 1;
    }

    return (
      this.facetForRange?.state.values.filter(({state}) => state === 'selected')
        .length || 0
    );
  }

  private get hasInputRange() {
    return !!this.filter?.state.range;
  }

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get searchStatusState() {
    return this.getSearchStatusState();
  }

  private get shouldRenderInput() {
    return shouldDisplayInputForFacetRange({
      hasInputRange: this.hasInputRange,
      searchStatusState: this.searchStatusState,
      facetValues: this.facetForInput?.state.values || [],
      hasInput: !!this.withInput,
    });
  }

  private get shouldRenderValues() {
    return (
      !this.hasInputRange &&
      this.numberOfValues > 0 &&
      !!this.valuesToRender.length
    );
  }
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

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
  }

  private registerFacetToStore() {
    this.bindings.store.registerFacet('numericFacets', {
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
      <FacetValuesGroup i18n={this.bindings.i18n} label={this.label}>
        <ul class="mt-3" part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }
  private get valuesToRender() {
    return (
      this.facetForRange?.state.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.valuesToRender.map((value) =>
        this.renderValue(value, () =>
          this.displayValuesAs === 'link'
            ? this.facetForRange!.toggleSingleSelect(value)
            : this.facetForRange!.toggleSelect(value)
        )
      )
    );
  }

  private renderNumberInput() {
    return (
      <atomic-facet-number-input
        type={this.withInput!}
        bindings={this.bindings}
        label={this.label}
        filter={this.filter!}
        filterState={this.filter!.state}
      ></atomic-facet-number-input>
    );
  }

  private renderHeader(
    headerFocus: FocusTargetController,
    isCollapsed: boolean,
    onToggleCollapse: () => void
  ) {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => {
          headerFocus.focusAfterSearch();
          if (this.filter?.state.range) {
            this.filter?.clear();
            return;
          }
          this.facetForRange?.deselectAll();
        }}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={isCollapsed}
        headingLevel={this.headingLevel}
        onToggleCollapse={onToggleCollapse}
        headerRef={headerFocus.setTarget}
      ></FacetHeader>
    );
  }

  public render({
    hasError,
    firstSearchExecuted,
    isCollapsed,
    headerFocus,
    onToggleCollapse,
  }: NumericFacetCommonRenderProps) {
    if (hasError || !this.enabled) {
      return <Hidden></Hidden>;
    }

    if (!firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={this.numberOfValues}
          isCollapsed={isCollapsed}
        ></FacetPlaceholder>
      );
    }

    if (!this.shouldRenderFacet) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader(headerFocus, isCollapsed, onToggleCollapse)}
        {!isCollapsed && [
          this.shouldRenderValues && this.renderValues(),
          this.shouldRenderInput && this.renderNumberInput(),
        ]}
      </FacetContainer>
    );
  }
}
