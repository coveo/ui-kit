import {facetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {facetGuard} from '@/src/components/common/facets/facet-guard';
import {facetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {renderFacetSearchInput} from '@/src/components/common/facets/facet-search/facet-search-input';
import {facetSearchInputGuard} from '@/src/components/common/facets/facet-search/facet-search-input-guard';
import {renderFacetSearchMatches} from '@/src/components/common/facets/facet-search/facet-search-matches';
import {renderFacetSearchValue} from '@/src/components/common/facets/facet-search/facet-search-value';
import {facetShowMoreLess} from '@/src/components/common/facets/facet-show-more-less/facet-show-more-less';
import {renderFacetValue} from '@/src/components/common/facets/facet-value/facet-value';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {
  AriaLiveRegion,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import {
  ProductListingSummaryState,
  RegularFacet,
  RegularFacetState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {FacetInfo} from '../../../common/facets/facet-common-store';
import {announceFacetSearchResultsWithAriaLive} from '../../../common/facets/facet-search/facet-search-aria-live';
import {
  shouldDisplaySearchResults,
  shouldUpdateFacetSearchComponent,
} from '../../../common/facets/facet-search/stencil-facet-search-utils';
import {FacetValueProps} from '../../../common/facets/facet-value/facet-value';
import {initializePopover} from '../../../common/facets/popover/popover-type';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';

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
@customElement('atomic-commerce-facet')
export class AtomicCommerceFacet
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  /**
   * The Summary controller instance.
   */
  @property({type: Object}) summary!: Summary<
    SearchSummaryState | ProductListingSummaryState
  >;
  /**
   * The facet controller instance.
   */
  @property({type: Object}) public facet!: RegularFacet;
  /**
   * Specifies whether the facet is collapsed.
   */
  // TODO: use boolean converter (https://github.com/coveo/ui-kit/pull/5121)
  @property({type: Boolean, reflect: true}) public isCollapsed = false;
  /**
   * The field identifier for this facet.
   */
  @property({reflect: true}) field?: string;

  @state() bindings!: CommerceBindings;

  @bindStateToController('summary', {overrideShouldUpdate: false}) // TODO: remove this!!
  @state()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  @state() public facetState!: RegularFacetState;
  @state() public error!: Error;

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
    // this.requestUpdate();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this.ensureSubscribed();
  }

  public disconnectedCallback(): void {
    this.unsubscribeFacetController?.();
    this.unsubscribeFacetController = undefined;
    super.disconnectedCallback();
  }

  protected shouldUpdate(
    changedProperties: Map<string | number | symbol, unknown>
  ): boolean {
    const prev = changedProperties.get('facetState');
    const next = this.facetState;

    if (
      this.isFacetState(prev, 'facetState') &&
      this.isFacetState(next, 'facetState')
    ) {
      return shouldUpdateFacetSearchComponent(
        next.facetSearch,
        prev.facetSearch
      );
    }
    return true;
  }

  @bindingGuard()
  @errorGuard()
  protected render() {
    console.log('=== Render ===', this.bindings);
    if (!this.facet) {
      return html`${nothing}`;
    }
    const {hasError, firstRequestExecuted} = this.summaryState;
    return html`
      ${facetGuard(
        {
          enabled: true,
          hasError,
          firstRequestExecuted,
          hasResults: this.facetState.values.length > 0,
        },
        () => facetContainer(html`${this.renderHeader()} ${this.renderBody()}`)
      )}
    `;
  }

  private renderHeader() {
    return facetHeader({
      i18n: this.bindings.i18n,
      label: this.displayName,
      numberOfActiveValues: this.activeValues.length,
      isCollapsed: this.isCollapsed,
      headingLevel: 0,
      onToggleCollapse: () => (this.isCollapsed = !this.isCollapsed),
      onClearFilters: () => {
        this.focusTargets.header.focusAfterSearch();
        this.facet.deselectAll();
      },
      headerRef: (el) => this.focusTargets.header.setTarget(el),
    });
  }

  private renderBody() {
    if (this.isCollapsed) {
      return;
    }
    return html`
      ${facetSearchInputGuard(
        {
          canShowMoreValues: this.facetState.canShowMoreValues,
          numberOfDisplayedValues: this.facetState.values.length,
          withSearch: true,
        },
        () =>
          html`${renderFacetSearchInput({
            i18n: this.bindings.i18n,
            label: this.displayName,
            query: this.facetState.facetSearch.query,
            onClear: () => this.facet.facetSearch.clear(),
            onChange: (value: string) => {
              if (value === '') {
                this.facet.facetSearch.clear();
                return; // TODO: nothing or no change
              }
              this.facet.facetSearch.updateText(value);
              this.facet.facetSearch.search();
            },
          })}
          ${shouldDisplaySearchResults(this.facetState.facetSearch)
            ? [this.renderSearchResults(), this.renderMatches()]
            : [this.renderValues(), this.renderShowMoreLess()]}`
      )}
    `;
  }

  private renderValuesContainer(children: unknown, query?: string) {
    // TODO: check for a better type
    return renderFacetValuesGroup({
      props: {
        i18n: this.bindings.i18n,
        label: this.displayName,
        query,
      },
    })(
      html`<ul part="values" class="mt-3">
        ${children}
      </ul>`
    );
  }

  private renderSearchResults() {
    return this.renderValuesContainer(
      this.facetState.facetSearch.values.map((value) =>
        renderFacetSearchValue({
          props: {
            ...this.facetValueProps,
            facetCount: value.count,
            onExclude: () => this.facet.facetSearch.exclude(value),
            onSelect: () => this.facet.facetSearch.select(value),
            facetValue: value.rawValue,
          },
        })
      )
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facetState.values.map((value, i) => {
        const shouldFocusOnShowLessAfterInteraction = i === 0;
        const shouldFocusOnShowMoreAfterInteraction = i === 0;

        return renderFacetValue({
          props: {
            ...this.facetValueProps,
            facetCount: value.numberOfResults,
            onExclude: () => this.facet.toggleExclude(value),
            onSelect: () => this.facet.toggleSelect(value),
            facetValue: value.value,
            facetState: value.state,
            setRef: (btn) => {
              if (shouldFocusOnShowLessAfterInteraction) {
                this.showLessFocus?.setTarget(btn as HTMLElement); // TODO: remove cast
              }
              if (shouldFocusOnShowMoreAfterInteraction) {
                this.showMoreFocus?.setTarget(btn as HTMLElement); // TODO: remove cast
              }
            },
          },
        });
      })
    );
  }

  private renderShowMoreLess() {
    return html`
      ${facetShowMoreLess({
        label: this.displayName,
        i18n: this.bindings.i18n,
        canShowLessValues: this.facetState.canShowLessValues,
        canShowMoreValues: this.facetState.canShowMoreValues,
        onShowLess: () => {
          this.focusTargets.showLess.focusAfterSearch();
          this.facet.showLessValues();
        },
        onShowMore: () => {
          this.focusTargets.showMore.focusAfterSearch();
          this.facet.showMoreValues();
        },
      })}
    `;
  }

  private renderMatches() {
    return renderFacetSearchMatches({
      i18n: this.bindings.i18n,
      query: this.facetState.facetSearch.query,
      numberOfMatches: this.facetState.facetSearch.values.length,
      hasMoreMatches: this.facetState.facetSearch.moreValuesAvailable,
    });
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
    initializePopover(this, {
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
      element: this,
      isHidden: () => this.isHidden,
    };
  }

  private get focusTargets(): {
    showLess: FocusTargetController;
    showMore: FocusTargetController;
    header: FocusTargetController;
  } {
    // TODO: this should be in the connected callback.
    // not here everytime a render call this!
    // Not efficient at all
    if (!this.showLessFocus) {
      // TODO: find a cleaner way to create a target controller
      this.showLessFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.showMoreFocus) {
      // TODO: find a cleaner way to create a target controller
      this.showMoreFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.headerFocus) {
      // TODO: find a cleaner way to create a target controller
      this.headerFocus = new FocusTargetController(this, this.bindings);
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
