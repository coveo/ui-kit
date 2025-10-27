import {FacetResultsMustMatch} from '@coveo/headless';
import {
  buildFacet as buildInsightFacet,
  buildFacetConditionsManager as buildInsightFacetConditionsManager,
  buildSearchStatus as buildInsightSearchStatus,
  CategoryFacetValueRequest as InsightCategoryFacetValueRequest,
  Facet as InsightFacet,
  FacetConditionsManager as InsightFacetConditionsManager,
  FacetOptions as InsightFacetOptions,
  FacetSortCriterion as InsightFacetSortCriterion,
  FacetState as InsightFacetState,
  FacetValueRequest as InsightFacetValueRequest,
  SearchStatus as InsightSearchStatus,
  SearchStatusState as InsightSearchStatusState,
} from '@coveo/headless/insight';
import {Component, h, State, Prop, Element, VNode} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  AriaLiveRegion,
  FocusTargetController,
} from '../../../utils/stencil-accessibility-utils';
import {parseDependsOn} from '../../common/facets/depends-on';
import {FacetInfo} from '../../common/facets/facet-common-store';
import {FacetContainer} from '../../common/facets/facet-container/stencil-facet-container';
import {FacetGuard} from '../../common/facets/stencil-facet-guard';
import {FacetHeader} from '../../common/facets/facet-header/stencil-facet-header';
import {FacetPlaceholder} from '../../common/facets/facet-placeholder/stencil-facet-placeholder';
import {announceFacetSearchResultsWithAriaLive} from '../../common/facets/facet-search/facet-search-aria-live';
import {FacetShowMoreLess} from '../../common/facets/facet-show-more-less/stencil-facet-show-more-less';
import {
  FacetValueProps,
  FacetValue,
} from '../../common/facets/facet-value/stencil-facet-value';
import {FacetValuesGroup} from '../../common/facets/facet-values-group/stencil-facet-values-group';
import {initializePopover} from '../../common/facets/popover/popover-type';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-facet',
  styleUrl: 'atomic-insight-facet.pcss',
  shadow: true,
})
export class AtomicInsightFacet
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public facet!: InsightFacet;
  public searchStatus!: InsightSearchStatus;
  public dependsOn = {};
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: InsightFacetState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: InsightSearchStatusState;
  @State() public error!: Error;

  /**
   * Specifies a unique identifier for the facet.
   */
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  /**
   * The non-localized label for the facet.
   */
  @Prop({reflect: true}) public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @Prop({reflect: true}) public numberOfValues = 8;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'alphanumericDescending', 'occurrences', alphanumericNatural', 'alphanumericNaturalDescending' and 'automatic'.
   */
  @Prop({reflect: true}) public sortCriteria: InsightFacetSortCriterion =
    'automatic';
  /**
   * Specifies how a result must match the selected facet values.
   * Allowed values:
   * - `atLeastOneValue`: A result will match if at least one of the corresponding facet values is selected.
   * - `allValues`: A result will match if all corresponding facet values are selected.
   */
  @Prop({reflect: true}) public resultsMustMatch: FacetResultsMustMatch =
    'atLeastOneValue';
  /**
   * Whether to display the facet values as checkboxes (multiple selection), links (single selection) or boxes (multiple selection).
   * Possible values are 'checkbox', 'link', and 'box'.
   */
  @Prop({reflect: true}) public displayValuesAs: 'checkbox' | 'link' | 'box' =
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
   *
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   */
  @Prop({reflect: true}) public filterFacetCount = true;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @Prop() public injectionDepth = 1000;
  /**
   * Whether to allow excluding values from the facet.
   */
  @Prop({reflect: true}) public enableExclusion = false;

  private showLessFocus?: FocusTargetController;
  private showMoreFocus?: FocusTargetController;
  private headerFocus?: FocusTargetController;
  private facetConditionsManager?: InsightFacetConditionsManager;

  @AriaLiveRegion('facet-search')
  protected facetSearchAriaMessage!: string;

  public initialize() {
    const options: InsightFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      facetSearch: {numberOfValues: this.numberOfValues},
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
    };

    this.facet = buildInsightFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
    this.initAriaLive();
    this.initConditionManager();
    this.initPopover();
    this.registerFacet();
  }

  private get focusTargets(): {
    showLess: FocusTargetController;
    showMore: FocusTargetController;
    header: FocusTargetController;
  } {
    if (!this.showLessFocus) {
      this.showLessFocus = new FocusTargetController(this);
    }
    if (!this.showMoreFocus) {
      this.showMoreFocus = new FocusTargetController(this);
    }
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this);
    }
    return {
      showLess: this.showLessFocus,
      showMore: this.showMoreFocus,
      header: this.headerFocus,
    };
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.facetConditionsManager?.stopWatching();
  }

  public render() {
    return (
      <FacetGuard
        enabled={this.facetState.enabled}
        hasError={this.searchStatusState.hasError}
        firstSearchExecuted={this.searchStatusState.firstSearchExecuted}
        hasResults={this.facetState.values.length > 0}
      >
        {this.searchStatusState.firstSearchExecuted ? (
          <FacetContainer>
            <FacetHeader
              i18n={this.bindings.i18n}
              label={this.label}
              onClearFilters={() => {
                this.focusTargets.header.focusAfterSearch();
                this.facet.deselectAll();
              }}
              numberOfActiveValues={this.activeValues.length}
              isCollapsed={this.isCollapsed}
              headingLevel={this.headingLevel}
              onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
              headerRef={(el) => this.focusTargets.header.setTarget(el)}
            ></FacetHeader>
            {this.renderBody()}
          </FacetContainer>
        ) : (
          <FacetPlaceholder
            numberOfValues={this.numberOfValues}
            isCollapsed={this.isCollapsed}
          />
        )}
      </FacetGuard>
    );
  }

  private renderBody() {
    if (this.isCollapsed) {
      return;
    }
    return [this.renderValues(), this.renderShowMoreLess()];
  }

  private renderValuesContainer(children: VNode[], query?: string) {
    const classes = `mt-3 ${
      this.displayValuesAs === 'box' ? 'box-container' : ''
    }`;
    return (
      <FacetValuesGroup
        i18n={this.bindings.i18n}
        label={this.label}
        query={query}
      >
        <ul class={classes} part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facet.state.values.map((value, i) => {
        const shouldFocusOnShowLessAfterInteraction = i === 0;
        const shouldFocusOnShowMoreAfterInteraction =
          i ===
          (this.sortCriteria === 'automatic'
            ? 0
            : this.facetState.values.length - 1);

        return (
          <FacetValue
            {...this.facetValueProps}
            facetCount={value.numberOfResults}
            onExclude={() => this.facet.toggleExclude(value)}
            onSelect={() =>
              this.displayValuesAs === 'link'
                ? this.facet.toggleSingleSelect(value)
                : this.facet.toggleSelect(value)
            }
            facetValue={value.value}
            facetState={value.state}
            setRef={(btn) => {
              if (shouldFocusOnShowLessAfterInteraction) {
                this.showLessFocus?.setTarget(btn);
              }
              if (shouldFocusOnShowMoreAfterInteraction) {
                this.showMoreFocus?.setTarget(btn);
              }
            }}
          />
        );
      })
    );
  }

  private renderShowMoreLess() {
    return (
      <FacetShowMoreLess
        label={this.label}
        i18n={this.bindings.i18n}
        onShowMore={() => {
          this.focusTargets.showMore.focusAfterSearch();
          this.facet.showMoreValues();
        }}
        onShowLess={() => {
          this.focusTargets.showLess.focusAfterSearch();
          this.facet.showLessValues();
        }}
        canShowMoreValues={this.facet.state.canShowMoreValues}
        canShowLessValues={this.facet.state.canShowLessValues}
      ></FacetShowMoreLess>
    );
  }

  private get activeValues() {
    return this.facet.state.values.filter(({state}) => state !== 'idle');
  }

  private get facetValueProps(): Pick<
    FacetValueProps,
    | 'displayValuesAs'
    | 'facetSearchQuery'
    | 'enableExclusion'
    | 'field'
    | 'i18n'
  > {
    return {
      facetSearchQuery: this.facetState.facetSearch.query,
      displayValuesAs: this.displayValuesAs,
      enableExclusion: this.enableExclusion,
      field: this.field,
      i18n: this.bindings.i18n,
    };
  }

  private initAriaLive() {
    announceFacetSearchResultsWithAriaLive(
      this.facet,
      this.label,
      (msg) => (this.facetSearchAriaMessage = msg),
      this.bindings.i18n
    );
  }

  private initConditionManager() {
    this.facetConditionsManager = buildInsightFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn<
          InsightFacetValueRequest | InsightCategoryFacetValueRequest
        >(this.dependsOn),
      }
    );
  }

  private initPopover() {
    initializePopover(this.host, {
      ...this.facetInfo,
      hasValues: () => !!this.facet.state.values.length,
      numberOfActiveValues: () => this.activeValues.length,
    });
  }

  private get isHidden() {
    return !this.facet.state.enabled || !this.facet.state.values.length;
  }

  private get facetInfo(): FacetInfo {
    return {
      label: () => this.bindings.i18n.t(this.label),
      facetId: this.facetId!,
      element: this.host,
      isHidden: () => this.isHidden,
    };
  }

  private registerFacet() {
    this.bindings.store.registerFacet('facets', this.facetInfo);
  }
}
