import type {
  ProductListingSummaryState,
  RegularFacet,
  RegularFacetState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import {type CSSResultGroup, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {renderFacetSearchInput} from '@/src/components/common/facets/facet-search/facet-search-input';
import {facetSearchInputGuard} from '@/src/components/common/facets/facet-search/facet-search-input-guard';
import {renderFacetSearchMatches} from '@/src/components/common/facets/facet-search/facet-search-matches';
import {renderFacetShowMoreLess} from '@/src/components/common/facets/facet-show-more-less/facet-show-more-less';
import {renderFacetValue} from '@/src/components/common/facets/facet-value/facet-value';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import facetCommonStyles from '../../common/facets/facet-common.tw.css';
import facetSearchStyles from '../../common/facets/facet-search/facet-search.tw.css';
import {announceFacetSearchResultsWithAriaLive} from '../../common/facets/facet-search/facet-search-aria-live';
import {
  shouldDisplaySearchResults,
  shouldUpdateFacetSearchComponent,
} from '../../common/facets/facet-search/facet-search-utils';
import type {FacetValueProps} from '../../common/facets/facet-value/facet-value';
import facetValueBoxStyles from '../../common/facets/facet-value-box/facet-value-box.tw.css';
import facetValueCheckboxStyles from '../../common/facets/facet-value-checkbox/facet-value-checkbox.tw.css';
import facetValueExcludeStyles from '../../common/facets/facet-value-exclude/facet-value-exclude.tw.css';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

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
 * @part search-wrapper - The facet search box wrapper.
 * @part search-input - The facet search box input.
 * @part search-icon - The facet search box submit button.
 * @part search-clear-button - The button to clear the facet search box of input.
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
 *
 * @part show-more - The show more values button.
 * @part show-less - The show less values button.
 * @part show-more-less-icon - The icons of the show more and show less buttons.
 */
@customElement('atomic-commerce-facet')
@bindings()
@withTailwindStyles
export class AtomicCommerceFacet
  extends LitElement
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
   * Whether the facet is collapsed.
   */
  @property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: 'is-collapsed',
  })
  public isCollapsed = false;
  /**
   * The field identifier for this facet.
   */
  @property({reflect: true}) field?: string;

  @state() bindings!: CommerceBindings;

  @bindStateToController('summary')
  @state()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  @bindStateToController('facet')
  @state()
  public facetState!: RegularFacetState;

  @state() public error!: Error;

  static styles: CSSResultGroup = [
    facetValueCheckboxStyles,
    facetSearchStyles,
    facetCommonStyles,
    facetValueExcludeStyles,
    facetValueBoxStyles,
  ];

  private showLessFocus!: FocusTargetController;
  private showMoreFocus!: FocusTargetController;
  private headerFocus!: FocusTargetController;
  private unsubscribeFacetController?: () => void;
  private ariaLiveRegion = new AriaLiveRegionController(this, 'facet-search');

  public initialize() {
    this.validateFacet();
    this.initFocusTargets();
    this.ensureSubscribed();
    this.facet && this.initAriaLive();
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

  private renderHeader() {
    return renderFacetHeader({
      props: {
        i18n: this.bindings.i18n,
        label: this.displayName,
        numberOfActiveValues: this.activeValues.length,
        isCollapsed: this.isCollapsed,
        headingLevel: 0,
        onToggleCollapse: () => {
          this.isCollapsed = !this.isCollapsed;
        },
        onClearFilters: () => {
          this.focusTargets.header.focusAfterSearch();
          this.facet.deselectAll();
        },
        headerRef: (el) => this.focusTargets.header.setTarget(el),
      },
    });
  }

  private renderBody() {
    if (this.isCollapsed) {
      return nothing;
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
            props: {
              i18n: this.bindings.i18n,
              label: this.displayName,
              query: this.facetState.facetSearch.query,
              onClear: () => this.facet.facetSearch.clear(),
              onChange: (value: string) => {
                if (value === '') {
                  this.facet.facetSearch.clear();
                  return;
                }
                this.facet.facetSearch.updateText(value);
                this.facet.facetSearch.search();
              },
            },
          })}`
      )}
      ${
        shouldDisplaySearchResults(this.facetState.facetSearch)
          ? [this.renderSearchResults(), this.renderMatches()]
          : [this.renderValues(), this.renderShowMoreLess()]
      }
    `;
  }

  private renderValuesContainer(children: unknown, query?: string) {
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
      this.facetState.facetSearch.values.map(
        (value) =>
          html`${renderFacetValue({
            props: {
              ...this.facetValueProps,
              facetState: 'idle',
              facetCount: value.count,
              onExclude: () => this.facet.facetSearch.exclude(value),
              onSelect: () => this.facet.facetSearch.select(value),
              facetValue: value.rawValue,
            },
          })}`
      )
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facetState.values.map((value, i) => {
        const shouldFocusAfterInteraction = i === 0;

        return renderFacetValue({
          props: {
            ...this.facetValueProps,
            facetCount: value.numberOfResults,
            onExclude: () => this.facet.toggleExclude(value),
            onSelect: () => this.facet.toggleSelect(value),
            facetValue: value.value,
            facetState: value.state,
            setRef: (btn) => {
              if (shouldFocusAfterInteraction) {
                this.showLessFocus?.setTarget(btn as HTMLElement);
              }
              if (shouldFocusAfterInteraction) {
                this.showMoreFocus?.setTarget(btn as HTMLElement);
              }
            },
          },
        });
      })
    );
  }

  private renderShowMoreLess() {
    return html`
      ${renderFacetShowMoreLess({
        props: {
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
        },
      })}
    `;
  }

  private renderMatches() {
    return renderFacetSearchMatches({
      props: {
        i18n: this.bindings.i18n,
        query: this.facetState.facetSearch.query,
        numberOfMatches: this.facetState.facetSearch.values.length,
        hasMoreMatches: this.facetState.facetSearch.moreValuesAvailable,
        showMoreMatches: () => this.facet.facetSearch.showMoreResults(),
      },
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

  private initFocusTargets() {
    if (!this.showLessFocus) {
      this.showLessFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.showMoreFocus) {
      this.showMoreFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
  }

  private initAriaLive() {
    announceFacetSearchResultsWithAriaLive(
      this.facet,
      this.displayName,
      (msg) => {
        this.ariaLiveRegion.message = msg;
      },
      this.bindings.i18n
    );
  }

  private get focusTargets(): {
    showLess: FocusTargetController;
    showMore: FocusTargetController;
    header: FocusTargetController;
  } {
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
    this.unsubscribeFacetController = this.facet?.subscribe(() => {
      this.facetState = this.facet.state;
    });
  }

  @bindingGuard()
  @errorGuard()
  protected render() {
    const {hasError, firstRequestExecuted} = this.summaryState;
    return html`
      ${when(
        !hasError && firstRequestExecuted && this.facetState.values.length > 0,
        () =>
          renderFacetContainer()(
            html`${this.renderHeader()} ${this.renderBody()}`
          )
      )}
    `;
  }

  public updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    if (changedProps.has('facet')) {
      this.validateFacet();
    }
  }

  private validateFacet() {
    if (!this.facet) {
      this.error = new Error(
        'The "facet" property is required for <atomic-commerce-facet>.'
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-facet': AtomicCommerceFacet;
  }
}
