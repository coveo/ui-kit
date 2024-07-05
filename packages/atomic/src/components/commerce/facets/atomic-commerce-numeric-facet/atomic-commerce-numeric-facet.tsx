import {
  NumericFacet,
  NumericFacetState,
  NumericRangeRequest,
  ProductListingSummaryState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {shouldDisplayInputForFacetRange} from '../../../common/facets/facet-common';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetGuard} from '../../../common/facets/facet-guard';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
import {formatHumanReadable} from '../../../common/facets/numeric-facet/formatter';
import {NumericFacetValueLink} from '../../../common/facets/numeric-facet/value-link';
import {NumericFacetValuesContainer} from '../../../common/facets/numeric-facet/values-container';
import {
  defaultNumberFormatter,
  NumberFormatter,
} from '../../../common/formats/format-common';
import {initializePopover} from '../../../search/facets/atomic-popover/popover-type';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import type {Range} from '../facet-number-input/atomic-commerce-facet-number-input';

/**
 * The `atomic-commerce-numeric-facet` component is responsible for rendering a commerce facet that allows the user to filter products using numeric ranges.
 *
 * @internal
 */
@Component({
  tag: 'atomic-commerce-numeric-facet',
  styleUrl: './atomic-commerce-numeric-facet.pcss',
  shadow: true,
})
export class AtomicCommerceNumericFacet
  implements InitializableComponent<Bindings>
{
  @InitializeBindings() public bindings!: Bindings;
  @Element() private host!: HTMLElement;

  @State() private range?: Range;

  @BindStateToController('facet')
  @State()
  public facetState!: NumericFacetState;

  @BindStateToController('summary')
  @State()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  @State() public error!: Error;

  private manualRanges: (NumericRangeRequest & {label?: string})[] = [];
  private formatter: NumberFormatter = defaultNumberFormatter;

  /**
   * The Summary controller instance.
   */
  @Prop() summary!: Summary<SearchSummaryState | ProductListingSummaryState>;
  /**
   * The numeric facet controller instance.
   */
  @Prop({reflect: true}) public facet!: NumericFacet;
  /**
   * Specifies whether the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
  /**
   * The field identifier for this facet.
   */
  @Prop({reflect: true}) field?: string;

  private headerFocus?: FocusTargetController;

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

  public initialize() {
    if (!this.facetState) {
      return;
    }
    this.registerFacetToStore();
  }

  private registerFacetToStore() {
    const {facetId, field} = this.facetState;
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: facetId,
      element: this.host,
      isHidden: () => this.isHidden,
    };

    this.bindings.store.registerFacet('numericFacets', {
      ...facetInfo,
      format: (value) =>
        formatHumanReadable({
          facetValue: value,
          logger: this.bindings.engine.logger,
          i18n: this.bindings.i18n,
          field: field,
          manualRanges: this.manualRanges,
          formatter: this.formatter,
        }),
    });

    initializePopover(this.host, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });
  }

  @Listen('atomic/numberFormat')
  public setFormat(event: CustomEvent<NumberFormatter>) {
    event.preventDefault();
    event.stopPropagation();
    this.formatter = event.detail;
  }

  @Listen('atomic/numberInputApply')
  public applyNumberInput({detail}: CustomEvent<Range>) {
    this.range = {start: detail.start, end: detail.end};
  }

  public render() {
    const {
      bindings: {i18n},
    } = this;
    const {firstRequestExecuted, hasError} = this.summaryState;
    return (
      <FacetGuard
        enabled={true}
        firstSearchExecuted={firstRequestExecuted}
        hasError={hasError}
        hasResults={this.shouldRenderFacet}
      >
        {
          <FacetContainer>
            <FacetHeader
              i18n={i18n}
              label={this.displayName}
              onClearFilters={() => {
                this.focusTarget.focusAfterSearch();
                this.facet.deselectAll();
                this.facet.setRanges([]);
              }}
              numberOfActiveValues={this.numberOfSelectedValues}
              isCollapsed={this.isCollapsed}
              headingLevel={0}
              onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
              headerRef={(el) => this.focusTarget.setTarget(el)}
            />
            {!this.isCollapsed && [
              this.shouldRenderValues && this.renderValues(),
              this.shouldRenderInput && (
                <atomic-commerce-facet-number-input
                  bindings={this.bindings}
                  label={this.displayName}
                  facet={this.facet}
                  range={this.range}
                ></atomic-commerce-facet-number-input>
              ),
            ]}
          </FacetContainer>
        }
      </FacetGuard>
    );
  }

  private renderValues() {
    const {
      manualRanges,
      displayName,
      bindings: {
        i18n,
        engine: {logger},
      },
      formatter,
    } = this;

    return (
      <NumericFacetValuesContainer i18n={i18n} label={displayName}>
        {this.valuesToRender.map((value) => (
          <NumericFacetValueLink
            formatter={formatter}
            displayValuesAs={'checkbox'}
            facetValue={value}
            field={this.facetState.field}
            i18n={i18n}
            logger={logger}
            manualRanges={manualRanges}
            onClick={() => this.facet.toggleSelect(value)}
          />
        ))}
      </NumericFacetValuesContainer>
    );
  }

  private get displayName() {
    return this.facetState.displayName || 'no-label';
  }

  private get numberOfSelectedValues() {
    if (this.range) {
      return 1;
    }

    return (
      this.facetState.values.filter(({state}) => state === 'selected').length ||
      0
    );
  }

  private get hasInputRange() {
    return !!this.range;
  }

  private get shouldRenderValues() {
    return !this.hasInputRange && !!this.valuesToRender.length;
  }

  private get valuesToRender() {
    return (
      this.facetState.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
  }

  private get shouldRenderInput() {
    const {
      firstRequestExecuted: firstSearchExecuted,
      hasError,
      isLoading,
      hasProducts: hasResults,
    } = this.summaryState;
    return shouldDisplayInputForFacetRange({
      hasInputRange: this.hasInputRange,
      searchStatusState: {
        firstSearchExecuted,
        hasError,
        hasResults,
        isLoading,
      },
      facetValues: this.facetState.values,
      hasInput: true,
    });
  }

  private get isHidden() {
    return !this.shouldRenderFacet;
  }

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get hasValues() {
    if (this.facetState.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
  }
}
