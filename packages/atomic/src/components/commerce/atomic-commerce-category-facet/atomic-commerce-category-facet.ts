import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import type {FacetInfo} from '@/src/components/common/facets/facet-common-store';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {announceFacetSearchResultsWithAriaLive} from '@/src/components/common/facets/facet-search/facet-search-aria-live';
import {renderFacetSearchInput} from '@/src/components/common/facets/facet-search/facet-search-input';
import {renderFacetSearchMatches} from '@/src/components/common/facets/facet-search/facet-search-matches';
import {
  shouldDisplaySearchResults,
  shouldUpdateFacetSearchComponent,
} from '@/src/components/common/facets/facet-search/facet-search-utils';
import {renderFacetShowMoreLess} from '@/src/components/common/facets/facet-show-more-less/facet-show-more-less';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '@/src/components/common/facets/popover/popover-type';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import type {
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetValue,
  ProductListingSummaryState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import type {CSSResultGroup} from 'lit';
import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import styles from './atomic-commerce-category-facet.tw.css';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-commerce-category-facet` displays a facet of values in a browsable, hierarchical fashion.
 *
 * @part facet - The wrapper for the entire facet.
 * @part placeholder - The placeholder shown before the first search is executed.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 *
 * @part search-wrapper - The search box wrapper.
 * @part search-input - The search box input.
 * @part search-icon - The search box submit button.
 * @part search-clear-button - The button to clear the search box of input.
 * @part more-matches - The label indicating there are more matches for the current facet search query.
 * @part no-matches - The label indicating there are no matches for the current facet search query.
 * @part matches-query - The highlighted query inside the matches labels.
 * @part search-results - The search results container.
 * @part search-result - The search result value.
 * @part search-result-path - The search result path.
 * @part search-highlight - The highlighted query inside the facet values.
 *
 * @part parents - The container surrounding the whole hierarchy of values.
 * @part sub-parents - The container surrounding a sub-hierarchy of values.
 * @part values - The container surrounding either the children of the active value or the values at the base.
 * @part all-categories-button - The "View all" button displayed first within the parents.
 * @part parent-button - The clickable parent button displayed first within sub-parents.
 * @part active-parent - The clickable active parent displayed first within the last sub-parents.
 * @part value-link - The clickable value displayed first within values.
 * @part back-arrow - The back arrow displayed before the clickable parents.
 * @part value-label - The facet value label within a value button.
 * @part value-count - The facet value count within a value button.
 * @part leaf-value - A facet value with no child value.
 * @part node-value - A facet value with child values.
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 *
 * @alpha
 */
@customElement('atomic-commerce-category-facet')
@withTailwindStyles
export class AtomicCommerceCategoryFacet
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  @state()
  bindings!: CommerceBindings;

  /**
   * The summary controller instance.
   */
  @property({attribute: false})
  summary!: Summary<SearchSummaryState | ProductListingSummaryState>;

  /**
   * The category facet controller instance.
   */
  @property({type: Object}) public facet!: CategoryFacet;

  /**
   * Specifies whether the facet is collapsed.
   */
  @property({
    reflect: true,
    type: Boolean,
    attribute: 'is-collapsed',
    converter: booleanConverter,
  })
  public isCollapsed = false;

  /**
   * The field identifier for this facet.
   */
  @property({reflect: true}) field?: string;

  @state()
  @bindStateToController('facet')
  public facetState!: CategoryFacetState;

  @bindStateToController('summary')
  @state()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  @state() public error!: Error;

  private resultIndexToFocusOnShowMore = 0;
  private showLessFocus?: FocusTargetController;
  private showMoreFocus?: FocusTargetController;
  private headerFocus?: FocusTargetController;
  private activeValueFocus?: FocusTargetController;
  private unsubscribeFacetController?: () => void;

  private facetSearchAriaMessage = new AriaLiveRegionController(
    this,
    'facet-search'
  );

  public initialize() {
    console.log('*********************');
    console.log(this.facet);
    console.log('*********************');

    if (!this.facet) {
      return;
    }
    this.ensureSubscribed();
    announceFacetSearchResultsWithAriaLive(
      this.facet,
      this.displayName,
      (msg) => {
        this.facetSearchAriaMessage.message = msg;
      },
      this.bindings.i18n
    );

    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: this.facetState.facetId,
      element: this,
      isHidden: () => this.isHidden,
    };

    initializePopover(this, {
      ...facetInfo,
      hasValues: () => !!this.facetState.values.length,
      numberOfActiveValues: () => (this.facetState.hasActiveValues ? 1 : 0),
    });
  }

  private get displayName() {
    return this.facetState?.displayName || 'no-label';
  }

  private get focusTargets() {
    if (!this.showLessFocus) {
      this.showLessFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.showMoreFocus) {
      this.showMoreFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.activeValueFocus) {
      this.activeValueFocus = new FocusTargetController(this, this.bindings);
    }

    return {
      showLessFocus: this.showLessFocus,
      showMoreFocus: this.showMoreFocus,
      headerFocus: this.headerFocus,
      activeValueFocus: this.activeValueFocus,
    };
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (!this.isConnected) {
      this.unsubscribeFacetController?.();
      this.unsubscribeFacetController = undefined;
    }
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this.ensureSubscribed();
  }

  private get isHidden() {
    return (
      this.summaryState.hasError ||
      (!this.facetState.values.length &&
        !this.facetState.selectedValueAncestry?.length)
    );
  }

  public shouldUpdate(
    changedProperties: Map<string | number | symbol, unknown>
  ): boolean {
    if (changedProperties.has('facetState')) {
      const newState = this.facetState;
      const oldState = changedProperties.get(
        'facetState'
      ) as CategoryFacetState;

      if (newState && oldState) {
        return shouldUpdateFacetSearchComponent(
          newState.facetSearch,
          oldState.facetSearch
        );
      }
    }
    return super.shouldUpdate(changedProperties);
  }

  private get hasParents() {
    return !!this.facetState.selectedValueAncestry?.length;
  }

  private renderHeader() {
    return renderFacetHeader({
      props: {
        i18n: this.bindings.i18n,
        label: this.displayName,
        numberOfActiveValues:
          this.facetState.hasActiveValues && this.isCollapsed ? 1 : 0,
        isCollapsed: this.isCollapsed,
        headingLevel: 0,
        onToggleCollapse: () => {
          this.isCollapsed = !this.isCollapsed;
        },
        onClearFilters: () => {
          this.focusTargets.headerFocus.focusAfterSearch();
          this.facet.deselectAll();
        },
        headerRef: (header) => {
          this.focusTargets.headerFocus.setTarget(header);
          if (!this.hasParents) {
            this.focusTargets.activeValueFocus.setTarget(header);
          }
        },
      },
    });
  }

  private renderSearchInput() {
    return renderFacetSearchInput({
      props: {
        i18n: this.bindings.i18n,
        label: this.displayName,
        query: this.facetState.facetSearch.query,
        onChange: (value: string) => {
          if (value === '') {
            this.facet.facetSearch.clear();
            return;
          }
          this.facet.facetSearch.updateText(value);
          this.facet.facetSearch.search();
        },
        onClear: () => this.facet.facetSearch.clear(),
      },
    });
  }

  private renderValuesTree(
    parents: CategoryFacetValue[],
    isRoot: boolean
  ): unknown {
    if (!this.hasParents) {
      return this.renderChildren();
    }

    if (isRoot) {
      return html`
        <div class="tree-value-container">
          ${this.renderAllCategoriesButton()}
          <div class="parent-as-tree-container not-top-level">
            ${this.renderValuesTree(parents, false)}
          </div>
        </div>
      `;
    }

    if (parents.length > 1) {
      const parentValue = parents[0];

      return html`
        <div class="tree-value-container">
          ${this.renderParentButton(parentValue)}
          <div class="parent-as-tree-container not-top-level">
            ${this.renderValuesTree(parents.slice(1), false)}
          </div>
        </div>
      `;
    }

    const activeParent = parents[0];
    const activeParentDisplayValue = getFieldValueCaption(
      this.facetState?.field,
      activeParent.value,
      this.bindings.i18n
    );

    return html`
      <div
        class="parent-value-link"
        part="active-parent value-link"
        @click=${() => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
      >
        <div class="value-content">
          <span class="value-label" part="value-label">
            ${activeParentDisplayValue}
          </span>
          <span class="value-count" part="value-count">
            ${activeParent.numberOfResults}
          </span>
        </div>
        <div class="children-as-tree-container">${this.renderChildren()}</div>
      </div>
    `;
  }

  private renderAllCategoriesButton() {
    return html`
      <button
        class="all-categories-button"
        part="all-categories-button"
        @click=${() => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
      >
        ${this.bindings.i18n.t('all-categories')}
      </button>
    `;
  }

  private renderParentButton(parentValue: CategoryFacetValue) {
    const displayValue = getFieldValueCaption(
      this.facetState?.field,
      parentValue.value,
      this.bindings.i18n
    );

    return html`
      <button
        class="parent-button"
        part="parent-button"
        @click=${() => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.toggleSelect(parentValue);
        }}
      >
        <div class="back-arrow" part="back-arrow"></div>
        <span class="value-label" part="value-label">${displayValue}</span>
        <span class="value-count" part="value-count">
          ${parentValue.numberOfResults}
        </span>
      </button>
    `;
  }

  private renderChild(
    facetValue: CategoryFacetValue,
    _isShowLessFocusTarget: boolean,
    _isShowMoreFocusTarget: boolean
  ) {
    const displayValue = getFieldValueCaption(
      this.facetState?.field,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state === 'selected';

    // TODO: is missing <CategoryFacetChildValueLink> component
    return html`
      <button
        class=${`child-value-link ${isSelected ? 'selected' : ''} ${
          facetValue.isLeafValue ? 'leaf-value' : 'node-value'
        }`}
        part="value-link ${facetValue.isLeafValue
          ? 'leaf-value'
          : 'node-value'}"
        @click=${() => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.toggleSelect(facetValue);
        }}
      >
        <span class="value-label" part="value-label">${displayValue}</span>
        <span class="value-count" part="value-count">
          ${facetValue.numberOfResults}
        </span>
      </button>
    `;
  }

  private renderChildren() {
    const {values, selectedValueAncestry, hasActiveValues} = this.facetState;
    const nextValues = hasActiveValues ? selectedValueAncestry : values;

    const children = nextValues?.length
      ? hasActiveValues
        ? nextValues[nextValues.length - 1].children
        : nextValues
      : [];

    return children.map((value, i) =>
      this.renderChild(value, i === 0, i === this.resultIndexToFocusOnShowMore)
    );
  }

  private renderSearchResults() {
    return html`
      <div class="search-results-container" part="search-results">
        ${this.facetState.facetSearch.values.map(
          (value) => html`
            <button
              class="search-result"
              part="search-result"
              @click=${() => {
                this.focusTargets.activeValueFocus.focusAfterSearch();
                this.facet.facetSearch.select(value);
              }}
            >
              <span class="value-label" part="value-label">
                ${value.displayValue}
              </span>
              <span class="value-count" part="value-count">
                ${value.count}
              </span>
            </button>
          `
        )}
      </div>
    `;
  }

  private renderMatches() {
    return renderFacetSearchMatches({
      props: {
        i18n: this.bindings.i18n,
        query: this.facetState.facetSearch.query,
        numberOfMatches: this.facetState.facetSearch.values.length,
        hasMoreMatches: this.facetState.facetSearch.moreValuesAvailable,
      },
    });
  }

  private renderShowMoreLess() {
    return html`
      <div class=${this.hasParents ? 'pl-9' : ''}>
        ${renderFacetShowMoreLess({
          props: {
            label: this.displayName,
            i18n: this.bindings.i18n,
            onShowMore: () => {
              this.resultIndexToFocusOnShowMore = this.facetState.values.length;
              this.focusTargets.showMoreFocus.focusAfterSearch();
              this.facet.showMoreValues();
            },
            onShowLess: () => {
              this.focusTargets.showLessFocus.focusAfterSearch();
              this.facet.showLessValues();
            },
            canShowLessValues: this.facetState.canShowLessValues,
            canShowMoreValues: this.facetState.canShowMoreValues,
          },
        })}
      </div>
    `;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const {
      bindings: {i18n},
      facetState: {facetSearch, selectedValueAncestry, values},
    } = this;

    const {hasError, firstRequestExecuted} = this.summaryState;

    // Simple guard logic inline
    if (!firstRequestExecuted || hasError || values.length === 0) {
      return html``;
    }

    return renderFacetContainer()(html`
      ${this.renderHeader()}
      ${when(
        !this.isCollapsed,
        () => html`
          ${this.renderSearchInput()}
          ${when(
            shouldDisplaySearchResults(facetSearch),
            () => html`
              ${facetSearch.values.length
                ? renderFacetValuesGroup({
                    props: {
                      i18n,
                      label: this.displayName,
                      query: facetSearch.query,
                    },
                  })(this.renderSearchResults())
                : html`<div class="mt-3"></div>`}
              ${this.renderMatches()}
            `,
            () => html`
              ${renderFacetValuesGroup({
                props: {
                  i18n,
                  label: this.displayName,
                },
              })(
                this.hasParents
                  ? html`
                      <div class="parent-as-tree-container top-level mt-3">
                        ${selectedValueAncestry &&
                        this.renderValuesTree(selectedValueAncestry, true)}
                      </div>
                    `
                  : html`
                      <div class="children-as-tree-container mt-3">
                        ${this.renderChildren()}
                      </div>
                    `
              )}
              ${this.renderShowMoreLess()}
            `
          )}
        `
      )}
    `);
  }

  private ensureSubscribed() {
    if (this.unsubscribeFacetController) {
      return;
    }
    this.unsubscribeFacetController = this.facet?.subscribe(() => {
      this.facetState = this.facet.state;
    });
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
    'atomic-commerce-category-facet': AtomicCommerceCategoryFacet;
  }
}
