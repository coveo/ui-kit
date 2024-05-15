import {
  NumericFacet,
  NumericFacetState,
  NumericRangeRequest,
  ListingSummary,
  SearchSummary,
  buildListingSummary,
  buildSearchSummary,
} from '@coveo/headless/commerce';
import {Component, Element, h, Listen, Prop, State} from '@stencil/core';
import {NumberInputType} from '../../../../components';
import {FocusTargetController} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {MapProp} from '../../../../utils/props-utils';
import {shouldDisplayInputForFacetRange} from '../../../common/facets/facet-common';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetGuard} from '../../../common/facets/facet-guard';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
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

@Component({
  tag: 'atomic-commerce-numeric-facet',
  styleUrl: './atomic-commerce-numeric-facet.pcss',
  shadow: true,
})
export class AtomicCommerceNumericFacet
  implements InitializableComponent<Bindings>
{
  @InitializeBindings() public bindings!: Bindings;
  // public facetForInput?: NumericFacet;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // public filter!: any; // TODO: should be NumericFilter
  @Element() private host!: HTMLElement;
  private manualRanges: (NumericRangeRequest & {label?: string})[] = [];
  private formatter: NumberFormatter = defaultNumberFormatter;

  // @State() private start?: number;
  // @State() private end?: number;
  @State() private range?: Range;

  // @BindStateToController('facetForRange')
  // @State()
  // public facetState!: NumericFacetState;
  @BindStateToController('filter')
  @State()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // public filterState?: any; // TODO: should be NumericFilterState;
  @State()
  public error!: Error;
  @BindStateToController('facetForInput')
  @State()
  public facetForInputState?: NumericFacetState; // TODO: this is never used

  private summary!: ListingSummary | SearchSummary;

  @Prop({reflect: true}) public facet!: NumericFacet;
  // private facetId?: string;
  // private withInput?: NumberInputType; // TODO: what to do with that
  private isCollapsed = false;
  // private numberOfValues = 8;
  // private  sortCriteria: RangeFacetSortCriterion = 'ascending';
  // private  rangeAlgorithm: RangeFacetRangeAlgorithm ='equiprobable';
  // private filterFacetCount = true;
  // private injectionDepth = 1000;

  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  /**
   * Whether this facet should contain an input allowing users to set custom ranges.
   * Depending on the field, the input can allow either decimal or integer values.
   */
  @Prop({reflect: true}) public withInput?: NumberInputType; // TODO: remove

  private headerFocus?: FocusTargetController;

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

  public initialize() {
    // this.computeFacetId();
    // TODO: support facet input
    this.initializeSummary();
    this.registerFacetToStore();
  }

  private initializeSummary() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.summary = buildListingSummary(this.bindings.engine);
    } else {
      this.summary = buildSearchSummary(this.bindings.engine);
    }
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

  @Listen('atomic/numberInputApply')
  public applyNumberInput({detail}: CustomEvent<Range>) {
    console.log('apply', detail);
    this.range = {start: detail.start, end: detail.end};
    // this.start = detail.start;
    // this.end = detail.end;
    // this.facet.state.facetId && // TODO: use getter
    //   this.bindings.engine.dispatch(
    //     loadNumericFacetSetActions(
    //       this.bindings.engine
    //     ).deselectAllNumericFacetValues(this.facet.state.facetId) // TODO: use getter
    //   );
  }

  public render() {
    console.log(this.range);

    const {
      bindings: {i18n},
    } = this;
    const {firstSearchExecuted, hasError} = this.summary.state;
    console.log('render');
    return (
      <FacetGuard
        enabled={true}
        firstSearchExecuted={firstSearchExecuted}
        hasError={hasError}
        hasResults={this.shouldRenderFacet}
      >
        {firstSearchExecuted ? (
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
                  type={this.withInput!}
                  bindings={this.bindings}
                  label={this.displayName}
                  domain={this.state.domain}
                  facetId={this.state.facetId}
                  setRanges={this.facet.setRanges}
                  range={this.range}
                ></atomic-commerce-facet-number-input>
              ),
            ]}
          </FacetContainer>
        ) : (
          <FacetPlaceholder isCollapsed={this.isCollapsed} numberOfValues={8} />
        )}
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
    if (this.range) {
      // TODO: not sure about this
      return 1;
    }

    return (
      this.facet?.state.values.filter(({state}) => state === 'selected')
        .length || 0
    );
  }

  private get hasInputRange() {
    // return !!this.filter?.state.range; // TODO: not sure about this. Should we check for the domain instead
    return !!this.range;
  }

  private get shouldRenderValues() {
    console.log(!this.hasInputRange, !!this.valuesToRender.length);
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
    const {firstSearchExecuted, hasError, isLoading, hasProducts} =
      this.summary.state;
    return shouldDisplayInputForFacetRange({
      // hasInputRange: this.hasInputRange,
      hasInputRange: true, // TODO: revisit this one
      searchStatusState: {
        firstSearchExecuted,
        hasError,
        hasResults: hasProducts,
        isLoading,
      },
      facetValues: this.state.values,
      // hasInput: !!this.withInput,
      hasInput: true, // TODO: revisit this one
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

// TODO: validate props this.withInput
