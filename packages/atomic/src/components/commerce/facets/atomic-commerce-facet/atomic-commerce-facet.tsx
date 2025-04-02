import {
  ProductListingSummaryState,
  RegularFacet,
  RegularFacetState,
  SearchSummaryState,
  Summary,
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
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  AriaLiveRegion,
  FocusTargetController,
} from '../../../../utils/stencil-accessibility-utils';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetGuard} from '../../../common/facets/facet-guard';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
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
import {initializePopover} from '../../../common/facets/popover/popover-type';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-facet` component renders a commerce facet that the end user can interact with to filter products.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part search-wrapper - The search box wrapper.
 * @part search-input - The search box input.
 * @part search-icon - The search box submit button.
 * @part search-clear-button - The button to clear the search box of input.
 * @part more-matches - The label indicating there are more matches for the current facet search query.
 * @part no-matches - The label indicating there are no matches for the current facet search query.
 * @part matches-query - The highlighted query inside the matches labels.
 * @part search-highlight - The highlighted query inside the facet values.
 *
 * @part values - The facet values container.
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 *
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-checked - The checked facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 * @part value-checkbox-icon - The facet value checkbox icon, available when display is 'checkbox'.
 * @part value-link - The facet value when display is 'link'.
 * @part value-link-selected - The selected facet value when display is 'link'.
 * @part value-box - The facet value when display is 'box'.
 * @part value-box-selected - The selected facet value when display is 'box'.
 * @part value-exclude-button - The button to exclude a facet value, available when display is 'checkbox'.
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 *
 * @alpha
 */
@Component({
  tag: 'atomic-commerce-facet',
  styleUrl: 'atomic-commerce-facet.pcss',
  shadow: true,
})
export class AtomicCommerceFacet implements InitializableComponent<Bindings> {
  @InitializeBindings() public bindings!: Bindings;
  @Element() private host!: HTMLElement;

  /**
   * The Summary controller instance.
   */
  @Prop() summary!: Summary<SearchSummaryState | ProductListingSummaryState>;
  /**
   * The facet controller instance.
   */
  @Prop() public facet!: RegularFacet;
  /**
   * Specifies whether the facet is collapsed.
   */
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;
  /**
   * The field identifier for this facet.
   */
  @Prop({reflect: true}) field?: string;

  @State()
  public facetState!: RegularFacetState;

  @BindStateToController('summary')
  @State()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  @State() public error!: Error;

  private showLessFocus?: FocusTargetController;
  private showMoreFocus?: FocusTargetController;
  private headerFocus?: FocusTargetController;
  private unsubscribeFacetController?: () => void | undefined;

  @AriaLiveRegion('facet-search')
  protected facetSearchAriaMessage!: string;

  public initialize() {
    if (!this.facet) {
      return;
    }
    this.ensureSubscribed();
    this.initAriaLive();
    this.initPopover();
  }

  public connectedCallback(): void {
    this.ensureSubscribed();
  }

  public disconnectedCallback(): void {
    this.unsubscribeFacetController?.();
    this.unsubscribeFacetController = undefined;
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
    if (!this.facet) {
      return;
    }
    const {hasError, firstRequestExecuted} = this.summaryState;
    return (
      <FacetGuard
        enabled={true}
        hasError={hasError}
        firstSearchExecuted={firstRequestExecuted}
        hasResults={this.facetState.values.length > 0}
      >
        {
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
              headingLevel={0}
              onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
              headerRef={(el) => this.focusTargets.header.setTarget(el)}
            ></FacetHeader>
            {this.renderBody()}
          </FacetContainer>
        }
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
          withSearch={true}
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
        <ul part="values" class="mt-3">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }

  private renderSearchResults() {
    return this.renderValuesContainer(
      this.facetState.facetSearch.values.map((value) => (
        <FacetSearchValue
          {...this.facetValueProps}
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
      this.facetState.values.map((value, i) => {
        const shouldFocusOnShowLessAfterInteraction = i === 0;
        const shouldFocusOnShowMoreAfterInteraction = i === 0;

        return (
          <FacetValue
            {...this.facetValueProps}
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
        canShowMoreValues={this.facetState.canShowMoreValues}
        canShowLessValues={this.facetState.canShowLessValues}
      ></FacetShowMoreLess>
    );
  }

  private renderMatches() {
    return (
      <FacetSearchMatches
        i18n={this.bindings.i18n}
        query={this.facetState.facetSearch.query}
        numberOfMatches={this.facetState.facetSearch.values.length}
        hasMoreMatches={this.facetState.facetSearch.moreValuesAvailable}
      ></FacetSearchMatches>
    );
  }

  private get activeValues() {
    return this.facetState.values.filter(({state}) => state !== 'idle');
  }

  private get displayName() {
    return this.facetState.displayName || 'no-label';
  }

  private get facetValueProps(): Pick<
    FacetValueProps,
    | 'facetSearchQuery'
    | 'enableExclusion'
    | 'field'
    | 'i18n'
    | 'displayValuesAs'
  > {
    return {
      facetSearchQuery: this.facetState.facetSearch.query,
      displayValuesAs: 'checkbox',
      enableExclusion: false,
      field: this.facetState.field,
      i18n: this.bindings.i18n,
    };
  }

  private get isHidden() {
    return !this.facetState.values.length;
  }

  private initPopover() {
    initializePopover(this.host, {
      ...this.facetInfo,
      hasValues: () => !!this.facetState.values.length,
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
      facetId: this.facetState.facetId,
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

  private ensureSubscribed() {
    if (this.unsubscribeFacetController) {
      return;
    }
    this.unsubscribeFacetController = this.facet.subscribe(
      () => (this.facetState = this.facet.state)
    );
  }
}
