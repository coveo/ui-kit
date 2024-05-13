import {
  FacetSortCriterion,
  FacetResultsMustMatch,
  buildSearchStatus,
  RegularFacet,
  SearchStatus,
  SearchStatusState,
  FacetConditionsManager,
  RegularFacetState,
} from '@coveo/headless/commerce';
import {
  Component,
  h,
  State,
  Prop,
  Element,
  VNode,
  Fragment,
} from '@stencil/core';
import {
  AriaLiveRegion,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {ArrayProp, MapProp} from '../../../../utils/props-utils';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetGuard} from '../../../common/facets/facet-guard';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
import {FacetPlaceholder} from '../../../common/facets/facet-placeholder/facet-placeholder';
import {announceFacetSearchResultsWithAriaLive} from '../../../common/facets/facet-search/facet-search-aria-live';
import {FacetSearchInput} from '../../../common/facets/facet-search/facet-search-input';
import {FacetSearchInputGuard} from '../../../common/facets/facet-search/facet-search-input-guard';
import {FacetSearchMatches} from '../../../common/facets/facet-search/facet-search-matches';
import {
  shouldDisplaySearchResults,
  shouldUpdateFacetSearchComponent,
} from '../../../common/facets/facet-search/facet-search-utils';
import {FacetSearchValue} from '../../../common/facets/facet-search/facet-search-value';
import {FacetShowMoreLess} from '../../../common/facets/facet-show-more-less/facet-show-more-less';
import {
  FacetValueProps,
  FacetValue,
} from '../../../common/facets/facet-value/facet-value';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '../../../search/facets/atomic-popover/popover-type';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

/**
 * TODO: document this component
 * @internal
 */
@Component({
  tag: 'atomic-commerce-facet',
  styleUrl: 'atomic-commerce-facet.pcss',
  shadow: true,
})
export class AtomicCommerceFacet implements InitializableComponent<Bindings> {
  @InitializeBindings() public bindings!: Bindings;
  public searchStatus!: SearchStatus;
  @Element() private host!: HTMLElement;

  @BindStateToController('facet')
  @State()
  public facetState!: RegularFacetState;

  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  @Prop() public facet!: RegularFacet;
  @Prop({reflect: true}) public numberOfValues = 8;
  @Prop({reflect: true}) public withSearch = true;
  @Prop({reflect: true}) public resultsMustMatch: FacetResultsMustMatch =
    'atLeastOneValue';
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
  @Prop({reflect: true}) public headingLevel = 0;
  @Prop({reflect: true}) public filterFacetCount = true;
  @Prop({reflect: true}) public enableExclusion = false;
  @Prop() public injectionDepth = 1000;

  @Prop({reflect: true}) public sortCriteria: FacetSortCriterion = 'automatic';

  @MapProp() @Prop() public dependsOn: Record<string, string> = {};
  @ArrayProp()
  @Prop({mutable: true})
  public allowedValues: string[] | string = '[]';

  @ArrayProp()
  @Prop({mutable: true})
  public customSort: string[] | string = '[]';

  private showLessFocus?: FocusTargetController;
  private showMoreFocus?: FocusTargetController;
  private headerFocus?: FocusTargetController;
  private facetConditionsManager?: FacetConditionsManager;

  @AriaLiveRegion('facet-search')
  protected facetSearchAriaMessage!: string;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.initAriaLive();
    // this.initConditionManager();
    this.initPopover();
    this.registerFacet();
  }

  public disconnectedCallback() {
    this.facetConditionsManager?.stopWatching();
  }

  public componentShouldUpdate(
    next: unknown,
    prev: unknown,
    propName: keyof AtomicCommerceFacet
  ) {
    if (
      this.isFacetState(prev, propName) &&
      this.isFacetState(next, propName)
    ) {
      return shouldUpdateFacetSearchComponent(
        next.facetSearch,
        prev.facetSearch
      );
    }
    return true;
  }

  public render() {
    return (
      <FacetGuard
        enabled={true}
        hasError={this.searchStatusState.hasError}
        firstSearchExecuted={this.searchStatusState.firstSearchExecuted}
        hasResults={this.facetState.values.length > 0}
      >
        {this.searchStatusState.firstSearchExecuted ? (
          <FacetContainer>
            <FacetHeader
              i18n={this.bindings.i18n}
              label={this.displayName}
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
    return (
      <Fragment>
        <FacetSearchInputGuard
          canShowMoreValues={this.facetState.canShowMoreValues}
          numberOfDisplayedValues={this.facetState.values.length}
          withSearch={this.withSearch}
        >
          <FacetSearchInput
            i18n={this.bindings.i18n}
            label={this.displayName}
            onChange={(value) => {
              if (value === '') {
                this.facet.facetSearch.clear();
                return;
              }
              this.facet.facetSearch.updateText(value);
              this.facet.facetSearch.search();
            }}
            onClear={() => this.facet.facetSearch.clear()}
            query={this.facetState.facetSearch.query}
          />
        </FacetSearchInputGuard>
        {shouldDisplaySearchResults(this.facetState.facetSearch)
          ? [this.renderSearchResults(), this.renderMatches()]
          : [this.renderValues(), this.renderShowMoreLess()]}
      </Fragment>
    );
  }

  private renderValuesContainer(children: VNode[], query?: string) {
    return (
      <FacetValuesGroup
        i18n={this.bindings.i18n}
        label={this.displayName}
        query={query}
      >
        <ul part="values">{children}</ul>
      </FacetValuesGroup>
    );
  }

  private renderSearchResults() {
    return this.renderValuesContainer(
      this.facet.state.facetSearch.values.map((value) => (
        <FacetSearchValue
          {...this.facetValueProps}
          displayValuesAs="checkbox"
          facetCount={value.count}
          onExclude={() => this.facet.facetSearch.exclude(value)}
          onSelect={() => this.facet.facetSearch.select(value)}
          facetValue={value.rawValue}
        />
      ))
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
            : this.facet.state.values.length - this.numberOfValues);

        return (
          <FacetValue
            {...this.facetValueProps}
            displayValuesAs="checkbox"
            facetCount={value.numberOfResults}
            onExclude={() => this.facet.toggleExclude(value)}
            onSelect={() => this.facet.toggleSelect(value)}
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
        label={this.displayName}
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

  private renderMatches() {
    return (
      <FacetSearchMatches
        i18n={this.bindings.i18n}
        query={this.facet.state.facetSearch.query}
        numberOfMatches={this.facet.state.facetSearch.values.length}
        hasMoreMatches={this.facet.state.facetSearch.moreValuesAvailable}
      ></FacetSearchMatches>
    );
  }

  private get activeValues() {
    return this.facet.state.values.filter(({state}) => state !== 'idle');
  }

  private get displayName() {
    return this.facet.state.displayName || 'no-label';
  }

  private get facetValueProps(): Pick<
    FacetValueProps,
    'facetSearchQuery' | 'enableExclusion' | 'field' | 'i18n'
  > {
    return {
      facetSearchQuery: this.facetState.facetSearch.query,
      enableExclusion: this.enableExclusion,
      field: this.facetState.field,
      i18n: this.bindings.i18n,
    };
  }

  private get isHidden() {
    return !this.facetState.values.length;
  }

  // private initConditionManager() {
  //   this.facetConditionsManager = buildFacetConditionsManager(
  //     this.bindings.engine,
  //     {
  //       facetId: this.facet.state.facetId,
  //       conditions: parseDependsOn<
  //         FacetValueRequest | CategoryFacetValueRequest
  //       >(this.dependsOn),
  //     }
  //   );
  // }

  private registerFacet() {
    this.bindings.store.registerFacet('facets', this.facetInfo);
  }

  private initPopover() {
    initializePopover(this.host, {
      ...this.facetInfo,
      hasValues: () => !!this.facet.state.values.length,
      numberOfActiveValues: () => this.activeValues.length,
    });
  }

  private initAriaLive() {
    announceFacetSearchResultsWithAriaLive(
      this.facet,
      this.displayName,
      (msg) => (this.facetSearchAriaMessage = msg),
      this.bindings.i18n
    );
  }

  private get facetInfo(): FacetInfo {
    return {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: this.facet.state.facetId,
      element: this.host,
      isHidden: () => this.isHidden,
    };
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

  private isFacetState(
    state: unknown,
    propName: string
  ): state is RegularFacetState {
    return (
      propName === 'facetState' &&
      typeof (state as RegularFacetState)?.facetId === 'string'
    );
  }
}
