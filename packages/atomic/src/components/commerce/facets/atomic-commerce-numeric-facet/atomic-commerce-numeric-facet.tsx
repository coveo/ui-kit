import {Schema, StringValue} from '@coveo/bueno';
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
import {NumberInputType} from '../../../common/facets/facet-number-input/number-input-type';
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

@Component({
  tag: 'atomic-commerce-numeric-facet',
  styleUrl: './atomic-commerce-numeric-facet.pcss',
  shadow: true,
})
export class AtomicCommerceNumericFacet
  implements InitializableComponent<Bindings>
{
  @InitializeBindings() public bindings!: Bindings;
  public facetForRange?: NumericFacet;
  public facetForInput?: NumericFacet;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public filter!: any; // TODO: should be NumericFilter
  @Element() private host!: HTMLElement;
  private manualRanges: (NumericRangeRequest & {label?: string})[] = [];
  private formatter: NumberFormatter = defaultNumberFormatter;

  @BindStateToController('facetForRange')
  @State()
  public facetState!: NumericFacetState;
  @BindStateToController('filter')
  @State()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public filterState?: any; // TODO: should be NumericFilterState;
  @State() public error!: Error;
  @BindStateToController('facetForInput')
  @State()
  public facetForInputState?: NumericFacetState; // TODO: this is never used

  private summary!: ListingSummary | SearchSummary;

  @Prop({reflect: true}) public facet!: NumericFacet;
  private facetId?: string;
  private field!: string;
  private withInput?: NumberInputType; // TODO: what to do with that
  private isCollapsed = false;
  // private numberOfValues = 8;
  // private  sortCriteria: RangeFacetSortCriterion = 'ascending';
  // private  rangeAlgorithm: RangeFacetRangeAlgorithm ='equiprobable';
  // private filterFacetCount = true;
  // private injectionDepth = 1000;

  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  private headerFocus?: FocusTargetController;

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return this.headerFocus;
  }

  public initialize() {
    this.validateProps();
    // this.computeFacetId();
    this.initializeFacetForInput();
    this.initializeFacetForRange();
    this.initializeFilter();
    this.initializeSummary();
    this.registerFacetToStore();
  }

  private initializeFacetForInput() {
    if (!this.withInput) {
      return;
    }
    // TODO: have controller with appropriate options
    // this.facetForInput = buildNumericFacet(this.bindings.engine, {
    //   options: {
    //     numberOfValues: 1,
    //     generateAutomaticRanges: true,
    //     facetId: `${this.facetId}_input_range`,
    //   },
    // });

    this.facetForInput = this.facet;

    return this.facetForInput;
  }

  private initializeFacetForRange() {
    // TODO: build manual ranges
    // this.manualRanges = Array.from(
    //   this.host.querySelectorAll('atomic-numeric-range')
    // ).map(({ start, end, endInclusive, label }) => ({
    //   ...buildNumericRange({ start, end, endInclusive }),
    //   label,
    // }));

    this.facetForRange = this.facet;
    // TODO: have controller with appropriate options
    // this.facetForRange = buildNumericFacet(this.bindings.engine, {
    //   options: {
    //     facetId: this.facetId,
    //     numberOfValues: this.numberOfValues,
    //     currentValues: this.manualRanges,
    //     generateAutomaticRanges: !this.manualRanges.length,
    //   },
    // });

    return this.facetForRange;
  }

  private initializeFilter() {
    if (!this.withInput) {
      return;
    }
    // TODO: build numeric filter
    // this.filter = buildNumericFilter(this.bindings.engine, {
    //   options: {
    //     facetId: `${this.facetId}_input`,
    //     field: this.field,
    //   },
    // });
  }

  private initializeSummary() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.summary = buildListingSummary(this.bindings.engine);
    } else {
      this.summary = buildSearchSummary(this.bindings.engine);
    }
  }

  private registerFacetToStore() {
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: this.facetId!,
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
          field: this.field,
          manualRanges: this.manualRanges,
          formatter: this.formatter,
        }),
    });

    initializePopover(this.host, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });

    if (this.filter) {
      this.bindings.store.state.numericFacets[this.filter.state.facetId] =
        this.bindings.store.state.numericFacets[this.facetId!];
    }
  }

  @Listen('atomic/numberFormat')
  public setFormat(event: CustomEvent<NumberFormatter>) {
    event.preventDefault();
    event.stopPropagation();
    this.formatter = event.detail;
  }

  // TODO: export facet set actions
  // @Listen('atomic/numberInputApply')
  // public applyNumberInput() {
  //   this.facetId &&
  //     this.bindings.engine.dispatch(
  //       loadNumericFacetSetActions(
  //         this.bindings.engine
  //       ).deselectAllNumericFacetValues(this.facetId)
  //     );
  // }

  public render() {
    const {
      bindings: {i18n},
    } = this;
    const {firstSearchExecuted, hasError} = this.summary.state;
    return (
      <FacetGuard
        enabled={this.enabled}
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
                if (this.filterState?.range) {
                  this.filter?.clear();
                  return;
                }
                this.facetForRange?.deselectAll();
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
                <atomic-facet-number-input
                  type={this.withInput!}
                  bindings={this.bindings}
                  label={this.displayName}
                  filter={this.filter!}
                  filterState={this.filter!.state}
                ></atomic-facet-number-input>
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
      field,
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
            field={field}
            i18n={i18n}
            logger={logger}
            manualRanges={manualRanges}
            onClick={() => this.facetForRange!.toggleSelect(value)}
          />
        ))}
      </NumericFacetValuesContainer>
    );
  }

  private get displayName() {
    return this.facetForInput?.state.displayName || 'no-label'; // TODO: this facet or the one for range?
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

  private get shouldRenderValues() {
    return !this.hasInputRange && !!this.valuesToRender.length;
  }

  private get hasInputRange() {
    return !!this.filter?.state.range;
  }

  private get valuesToRender() {
    return (
      this.facetForRange?.state.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
  }

  private get shouldRenderInput() {
    const {hasError, hasProducts, isLoading, firstSearchExecuted} =
      this.summary.state;
    return shouldDisplayInputForFacetRange({
      hasInputRange: this.hasInputRange,
      searchStatusState: {
        hasError,
        isLoading,
        firstSearchExecuted,
        hasResults: hasProducts,
      },
      facetValues: this.facetForInput?.state.values || [],
      hasInput: !!this.withInput,
    });
  }

  // private computeFacetId() {
  //   if (this.facetId) {
  //     return;
  //   }

  //   if (this.bindings.store.get('numericFacets')[this.field]) {
  //     this.facetId = randomID(`${this.field}_`);
  //   }

  //   this.facetId = this.field;
  // }

  private get enabled() {
    // return this.facetState?.enabled ?? this.filter?.state.enabled ?? true;
    return this.filter?.state.enabled ?? true;
  }

  private get isHidden() {
    return !this.shouldRenderFacet || !this.enabled;
  }

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get hasValues() {
    if (this.facetForInput?.state.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
  }

  private validateProps() {
    new Schema({
      withInput: new StringValue({constrainTo: ['integer', 'decimal']}),
    }).validate({
      withInput: this.withInput,
    });
  }
}
