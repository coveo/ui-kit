import {Schema, StringValue} from '@coveo/bueno';
import {VNode, h} from '@stencil/core';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {randomID} from '../../../utils/utils';
import {initializePopover} from '../../search/facets/atomic-popover/popover-type';
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
import {FacetInfo} from './facet-common-store';
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
  facetId?: string;
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
  private facetId: string;
  private filter?: NumericFilter;
  private manualRanges: NumericRangeWithLabel[] = [];
  private facetForRange?: NumericFacet;
  private facetForInput?: NumericFacet;

  private dependenciesManager: FacetConditionsManager;

  constructor(private props: NumericFacetCommonOptions) {
    this.validateProps();
    this.facetId = this.determineFacetId;
    this.props.setFacetId(this.facetId);

    // Initialize two facets: One that is actually used to display values for end users, which only exists
    // if we need to display something to the end user (ie: numberOfValues > 0)

    // A second facet is initialized only to verify the results count. It is never used to display results to end user.
    // It serves as a way to determine if the input should be rendered or not, independent of the ranges (manual or automatic) configured in the component
    if (this.props.numberOfValues > 0) {
      this.manualRanges = this.props.setManualRanges(
        Array.from(
          this.props.host.querySelectorAll('atomic-numeric-range')
        ).map(({start, end, endInclusive, label}) => ({
          ...this.props.buildNumericRange({start, end, endInclusive}),
          label,
        }))
      );
      this.facetForRange = this.props.initializeFacetForRange();
    }

    if (this.props.withInput) {
      this.facetForInput = this.props.initializeFacetForInput();
      this.filter = this.props.initializeFilter();
    }

    this.dependenciesManager = this.props.buildDependenciesManager();
    this.registerFacetToStore();
  }

  private get determineFacetId() {
    if (this.props.facetId) {
      return this.props.facetId;
    }

    if (this.props.bindings.store.get('numericFacets')[this.props.field]) {
      return randomID(`${this.props.field}_`);
    }

    return this.props.field;
  }

  private get formatter() {
    return this.props.getFormatter();
  }

  private get enabled() {
    return (
      this.facetForRange?.state.enabled ?? this.filter?.state.enabled ?? true
    );
  }

  private get hasValues() {
    if (this.facetForInput?.state.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
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
    return this.props.getSearchStatusState();
  }

  private get shouldRenderInput() {
    return shouldDisplayInputForFacetRange({
      hasInputRange: this.hasInputRange,
      searchStatusState: this.searchStatusState,
      facetValues: this.facetForInput?.state.values || [],
      hasInput: !!this.props.withInput,
    });
  }

  private get shouldRenderValues() {
    return (
      !this.hasInputRange &&
      this.props.numberOfValues > 0 &&
      !!this.valuesToRender.length
    );
  }
  private validateProps() {
    new Schema({
      displayValuesAs: new StringValue({constrainTo: ['checkbox', 'link']}),
      withInput: new StringValue({constrainTo: ['integer', 'decimal']}),
    }).validate({
      displayValuesAs: this.props.displayValuesAs,
      withInput: this.props.withInput,
    });
    validateDependsOn(this.props.dependsOn);
  }

  public disconnectedCallback() {
    if (this.props.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
  }

  private get isHidden() {
    return !this.shouldRenderFacet || !this.enabled;
  }

  private registerFacetToStore() {
    const facetInfo: FacetInfo = {
      label: () => this.props.bindings.i18n.t(this.props.label),
      facetId: this.facetId!,
      element: this.props.host,
      isHidden: () => this.isHidden,
    };

    this.props.bindings.store.registerFacet('numericFacets', {
      ...facetInfo,
      format: (value) => this.formatFacetValue(value),
    });

    initializePopover(this.props.host, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });

    if (this.filter) {
      this.props.bindings.store.state.numericFacets[this.filter.state.facetId] =
        this.props.bindings.store.state.numericFacets[this.facetId!];
    }
  }

  private formatFacetValue(facetValue: NumericFacetValue) {
    const manualRangeLabel = this.manualRanges.find((range) =>
      this.areRangesEqual(range, facetValue)
    )?.label;
    return manualRangeLabel
      ? getFieldValueCaption(
          this.props.field,
          manualRangeLabel,
          this.props.bindings.i18n
        )
      : this.props.bindings.i18n.t('to', {
          start: this.formatValue(facetValue.start),
          end: this.formatValue(facetValue.end),
        });
  }

  private formatValue(value: number) {
    try {
      return this.formatter(
        value,
        this.props.bindings.i18n.languages as string[]
      );
    } catch (error) {
      this.props.bindings.engine.logger.error(
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
    switch (this.props.displayValuesAs) {
      case 'checkbox':
        return (
          <FacetValueCheckbox
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.props.bindings.i18n}
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
            i18n={this.props.bindings.i18n}
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
      <FacetValuesGroup
        i18n={this.props.bindings.i18n}
        label={this.props.label}
      >
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
          this.props.displayValuesAs === 'link'
            ? this.facetForRange!.toggleSingleSelect(value)
            : this.facetForRange!.toggleSelect(value)
        )
      )
    );
  }

  private renderNumberInput() {
    return (
      <atomic-facet-number-input
        type={this.props.withInput!}
        bindings={this.props.bindings}
        label={this.props.label}
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
        i18n={this.props.bindings.i18n}
        label={this.props.label}
        onClearFilters={() => {
          headerFocus.focusAfterSearch();
          if (this.filter?.state.range) {
            this.filter?.clear();
            return;
          }
          this.facetForRange?.deselectAll();
        }}
        numberOfActiveValues={this.numberOfSelectedValues}
        isCollapsed={isCollapsed}
        headingLevel={this.props.headingLevel}
        onToggleCollapse={onToggleCollapse}
        headerRef={(el) => headerFocus.setTarget(el)}
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
          numberOfValues={this.props.numberOfValues}
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
