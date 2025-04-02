import {
  NumericFacet,
  NumericFacetState,
  NumericRangeRequest,
  ProductListingSummaryState,
  SearchSummaryState,
  Summary,
  Context,
  ContextState,
  buildContext,
} from '@coveo/headless/commerce';
import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {FocusTargetController} from '../../../../utils/stencil-accessibility-utils';
import {shouldDisplayInputForFacetRange} from '../../../common/facets/facet-common';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetGuard} from '../../../common/facets/facet-guard';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
import {NumericFacetValueLink} from '../../../common/facets/numeric-facet/value-link';
import {NumericFacetValuesContainer} from '../../../common/facets/numeric-facet/values-container';
import {initializePopover} from '../../../common/facets/popover/popover-type';
import {
  defaultCurrencyFormatter,
  defaultNumberFormatter,
} from '../../../common/formats/format-common';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import type {Range} from '../facet-number-input/atomic-commerce-facet-number-input';

/**
 * The `atomic-commerce-numeric-facet` component is responsible for rendering a commerce facet that allows the user to filter products using numeric ranges.
 *
 * @alpha
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

  @BindStateToController('facet')
  @State()
  public facetState!: NumericFacetState;

  @BindStateToController('summary')
  @State()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  public context!: Context;
  @BindStateToController('context') contextState!: ContextState;

  @State() public error!: Error;

  private manualRanges: (NumericRangeRequest & {label?: string})[] = [];

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

  private unsubscribeFacetController?: () => void | undefined;

  public initialize() {
    if (!this.facet) {
      return;
    }

    this.context = buildContext(this.bindings.engine);
    this.ensureSubscribed();
    this.registerFacetToStore();
  }

  public connectedCallback() {
    this.ensureSubscribed();
  }

  public disconnectedCallback() {
    this.unsubscribeFacetController?.();
    this.unsubscribeFacetController = undefined;
  }

  private get formatter() {
    if (this.field === 'ec_price' || this.field === 'ec_promo_price') {
      return defaultCurrencyFormatter(this.contextState.currency);
    }
    return defaultNumberFormatter;
  }

  private registerFacetToStore() {
    const {facetId} = this.facetState;
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: facetId,
      element: this.host,
      isHidden: () => this.isHidden,
    };

    initializePopover(this.host, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });
  }

  @Listen('atomic/numberInputApply')
  public applyNumberInput({detail}: CustomEvent<Range>) {
    const {start, end} = detail;
    this.facet.setRanges([
      {
        start,
        end,
        endInclusive: true,
        state: 'selected',
      },
    ]);
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
                  range={this.facetState.manualRange}
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
    return (
      this.facetState.values.filter(({state}) => state === 'selected').length ||
      0
    );
  }

  private get hasInputRange() {
    return !!this.facetState.manualRange || this.summaryState.isLoading;
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

  private ensureSubscribed() {
    if (this.unsubscribeFacetController) {
      return;
    }
    this.unsubscribeFacetController = this.facet.subscribe(
      () => (this.facetState = this.facet.state)
    );
  }
}
