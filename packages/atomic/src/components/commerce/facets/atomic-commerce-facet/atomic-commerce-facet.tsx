import {
  // TODO: move to commerce endpoint
  FacetSortCriterion,
  FacetResultsMustMatch,
  FacetState, // FacetOptions,
} from '@coveo/headless';
import {
  buildSearchStatus,
  RegularFacet,
  SearchStatus,
  SearchStatusState,
  FacetConditionsManager,
  FacetValueRequest,
  CategoryFacetValueRequest,
  buildFacetConditionsManager,
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
import {parseDependsOn} from '../../../common/facets/depends-on';
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

// import { initializePopover } from '../atomic-popover/popover-type';

/**
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

  @BindStateToController('facet') // TODO: maybe should be commercefacet
  @State()
  public facetState!: FacetState;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  @Prop() public facet!: RegularFacet;
  @Prop({mutable: true, reflect: true}) public facetId?: string;
  @Prop({reflect: true}) public label = 'no-label';
  @Prop({reflect: true}) public field!: string;
  @Prop({reflect: true}) public numberOfValues = 8;
  @Prop({reflect: true}) public withSearch = true;
  @Prop({reflect: true}) public sortCriteria: FacetSortCriterion = 'automatic';
  @Prop({reflect: true}) public resultsMustMatch: FacetResultsMustMatch =
    'atLeastOneValue';
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
  @Prop({reflect: true}) public headingLevel = 0;
  @Prop({reflect: true}) public filterFacetCount = true;
  @Prop({reflect: true}) public enableExclusion = false;
  @Prop() public injectionDepth = 1000;

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
    this.facetId = this.facet.state.facetId;
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.initAriaLive();
    this.initConditionManager();
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
        enabled={this.facetState.enabled}
        hasError={this.searchStatusState.hasError}
        firstSearchExecuted={this.searchStatusState.firstSearchExecuted}
        hasResults={this.facetState.values.length > 0}
      >
        {this.searchStatusState.firstSearchExecuted ? (
          <FacetContainer>
            <FacetHeader
              i18n={this.bindings.i18n}
              label={this.definedLabel}
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
            label={this.definedLabel}
            onChange={(value) => {
              if (value === '') {
                this.facet.facetSearch.clear();
                return;
              }
              // TODO: implement updateCaptions
              // this.facetState.updateCaptions(
              //     getFieldCaptions(this.field, this.bindings.i18n)
              // );
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
        label={this.label}
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
          displayValuesAs="checkbox" // TODO: put in default props
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
            displayValuesAs="checkbox" // TODO: put in default props
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

  // Options are already provided in the controller
  // private get facetOptions(): FacetOptions {
  //     return {
  //         facetId: this.facetId,
  //         field: this.field,
  //         numberOfValues: this.numberOfValues,
  //         sortCriteria: this.sortCriteria,
  //         resultsMustMatch: this.resultsMustMatch,
  //         facetSearch: { numberOfValues: this.numberOfValues },
  //         filterFacetCount: this.filterFacetCount,
  //         injectionDepth: this.injectionDepth,
  //         allowedValues: this.allowedValues.length
  //             ? [...this.allowedValues]
  //             : undefined,
  //         customSort: this.customSort.length ? [...this.customSort] : undefined,
  //     };
  // }

  private get facetValueProps(): Pick<
    FacetValueProps,
    'facetSearchQuery' | 'enableExclusion' | 'field' | 'i18n'
  > {
    return {
      facetSearchQuery: this.facetState.facetSearch.query,
      enableExclusion: this.enableExclusion,
      field: this.field,
      i18n: this.bindings.i18n,
    };
  }

  private get isHidden() {
    return !this.facetState.enabled || !this.facetState.values.length;
  }

  private initConditionManager() {
    this.facetConditionsManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn<
          FacetValueRequest | CategoryFacetValueRequest
        >(this.dependsOn),
      }
    );
  }

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
      this.label,
      (msg) => (this.facetSearchAriaMessage = msg),
      this.bindings.i18n
    );
  }

  private get facetInfo(): FacetInfo {
    return {
      label: () => this.bindings.i18n.t(this.label),
      facetId: this.facetId!,
      element: this.host,
      isHidden: () => this.isHidden,
    };
  }

  private get definedLabel() {
    return this.label === 'no-label' && this.facetState?.label
      ? this.facetState.label
      : this.label;
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

  private isFacetState(state: unknown, propName: string): state is FacetState {
    return (
      propName === 'facetState' &&
      typeof (state as FacetState)?.facetId === 'string'
    );
  }
}
