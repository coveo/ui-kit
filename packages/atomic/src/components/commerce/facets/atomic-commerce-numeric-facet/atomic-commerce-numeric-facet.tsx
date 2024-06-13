import {
  NumericFacet,
  NumericFacetState,
  NumericRangeRequest,
  ListingSummary,
  SearchSummary,
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

  @BindStateToController('facet')
  @State()
  public facetState!: NumericFacetState;

  @State() public error!: Error;

  private manualRanges: (NumericRangeRequest & {label?: string})[] = [];
  private formatter: NumberFormatter = defaultNumberFormatter;

  /**
   * The Summary controller instance.
   */
  @Prop() summary!: SearchSummary | ListingSummary;
  /**
   * The numeric facet controller instance.
   */
  @Prop({reflect: true}) public facet!: NumericFacet;
  /**
   * Specifies whether the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;

  private headerFocus?: FocusTargetController;

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

  public initialize() {
    this.registerFacetToStore();
  }

  private registerFacetToStore() {
    const {facetId, field} = this.state;
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: facetId!,
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

  public render() {
    console.log('*********************');
    console.log(this.facetState.range);
    console.log('*********************');

    const {
      bindings: {i18n},
    } = this;
    const {firstSearchExecuted, hasError} = this.summary.state;
    return (
      <FacetGuard
        enabled={true}
        firstSearchExecuted={firstSearchExecuted}
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
                  inputRange={this.facetState.range} // TODO: check if can only use the facet prop instead of haveing an additional prop
                  // No becaus of non commerce setup
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
            field={this.state.field}
            i18n={i18n}
            logger={logger}
            manualRanges={manualRanges}
            onClick={() => this.facet!.toggleSelect(value)}
          />
        ))}
      </NumericFacetValuesContainer>
    );
  }

  private get state() {
    return this.facet.state;
  }

  private get displayName() {
    return this.state.displayName || 'no-label';
  }

  private get numberOfSelectedValues() {
    if (this.facetState.range) {
      return 1;
    }

    return (
      this.facet?.state.values.filter(({state}) => state === 'selected')
        .length || 0
    );
  }

  private get hasInputRange() {
    return !!this.facetState.range;
  }

  private get shouldRenderValues() {
    // TODO: load commerce selector to know if it is custom selected values
    return !this.hasInputRange && !!this.valuesToRender.length;
  }

  private get valuesToRender() {
    return (
      this.facet?.state.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
  }

  private get shouldRenderInput() {
    const {
      firstSearchExecuted,
      hasError,
      isLoading,
      hasProducts: hasResults,
    } = this.summary.state;
    return shouldDisplayInputForFacetRange({
      hasInputRange: this.hasInputRange,
      searchStatusState: {
        firstSearchExecuted,
        hasError,
        hasResults,
        isLoading,
      },
      facetValues: this.state.values,
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
    if (this.state.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
  }
}
