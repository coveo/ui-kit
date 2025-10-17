import type {
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetValue,
  ProductListingSummaryState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import type {CSSResultGroup, TemplateResult} from 'lit';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
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
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import {renderCategoryFacetAllCategoryButton} from '../../common/facets/category-facet/all-categories-button';
import {renderCategoryFacetChildrenAsTreeContainer} from '../../common/facets/category-facet/children-as-tree-container';
import {renderCategoryFacetParentAsTreeContainer} from '../../common/facets/category-facet/parent-as-tree-container';
import {renderCategoryFacetParentButton} from '../../common/facets/category-facet/parent-button';
import {renderCategoryFacetParentValueLink} from '../../common/facets/category-facet/parent-value-link';
import {renderCategoryFacetSearchResultsContainer} from '../../common/facets/category-facet/search-results-container';
import {renderCategoryFacetSearchValue} from '../../common/facets/category-facet/search-value';
import {renderCategoryFacetTreeValueContainer} from '../../common/facets/category-facet/value-as-tree-container';
import {renderCategoryFacetValueLink} from '../../common/facets/category-facet/value-link';
import facetCommonStyles from '../../common/facets/facet-common.tw.css';
import facetSearchStyles from '../../common/facets/facet-search/facet-search.tw.css';

/**
 * A facet is a list of values for a certain field occurring in the products.
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
 * @part search-clear-button - The button to clear the search box input.
 * @part more-matches - The label indicating there are more matches for the current facet search query.
 * @part no-matches - The label indicating there are no matches for the current facet search query.
 * @part matches-query - The highlighted query inside the matches labels.
 * @part search-results - The facet search results container.
 * @part search-result - The facet search result value.
 * @part search-result-path - The facet search result path.
 * @part search-highlight - The highlighted query inside the facet values.
 *
 * @part parents - The container surrounding the whole hierarchy of values.
 * @part sub-parents - The container surrounding a sub-hierarchy of values.
 * @part values - The container surrounding either the children of the active value or the values at the base.
 * @part all-categories-button - The "All categories" button displayed first within the parents.
 * @part parent-button - The clickable parent button displayed first within sub-parents.
 * @part active-parent - The clickable active parent displayed first within the last sub-parents.
 * @part value-link - The clickable value displayed first within values.
 * @part back-arrow - The back arrow displayed before the clickable parents.
 * @part value-label - The facet value label within a value button.
 * @part value-count - The facet value count within a value button.
 * @part leaf-value - A facet value with no child value.
 * @part node-value - A facet value with child values.
 *
 * @part show-more - The "Show more" button.
 * @part show-less - The "Show less" button.
 * @part show-more-less-icon - The icons of the "Show more" and "Show less" buttons.
 *
 */
@customElement('atomic-commerce-category-facet')
@bindings()
@withTailwindStyles
export class AtomicCommerceCategoryFacet
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [
    facetCommonStyles,
    facetSearchStyles,
    css`
    @reference '../../../utils/tailwind.global.tw.css';
    [part~="active-parent"] {
      @apply pl-9;
    }
    
    [part~="parents"] [part~="values"] {
      @apply pl-9;
    }
    
    [part~="all-categories-button"],
    [part~="parent-button"] {
      @apply relative flex w-full items-center py-2.5 pr-2 pl-7 text-left;
    }
    
    [part~="back-arrow"] {
      @apply absolute left-1 h-5 w-5;
    }`,
  ];

  @state()
  bindings!: CommerceBindings;

  /**
   * The summary controller instance.
   */
  @property({type: Object})
  summary!: Summary<SearchSummaryState | ProductListingSummaryState>;

  /**
   * The category facet controller instance.
   */
  @property({type: Object}) public facet!: CategoryFacet;

  /**
   * Whether the facet is collapsed.
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

  private facetSearchAriaMessage = new AriaLiveRegionController(
    this,
    'facet-search'
  );

  public initialize() {
    this.validateFacet();
    this.facet &&
      announceFacetSearchResultsWithAriaLive(
        this.facet,
        this.displayName,
        (msg) => {
          this.facetSearchAriaMessage.message = msg;
        },
        this.bindings.i18n
      );
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

  private renderValuesTree(
    parents: CategoryFacetValue[],
    isRoot: boolean
  ): TemplateResult {
    if (!this.hasParents) {
      return this.renderChildren();
    }

    if (isRoot) {
      return renderCategoryFacetTreeValueContainer()(html`
        ${renderCategoryFacetAllCategoryButton({
          props: {
            i18n: this.bindings.i18n,
            onClick: () => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.deselectAll();
            },
            facetId: this.facetState.facetId,
            field: this.facet.state.field,
          },
        })}
        ${renderCategoryFacetParentAsTreeContainer({
          props: {
            isTopLevel: false,
          },
        })(html`${this.renderValuesTree(parents, false)} `)}
      `);
    }

    if (parents.length > 1) {
      const parentValue = parents[0];

      return renderCategoryFacetTreeValueContainer()(html`
        ${renderCategoryFacetParentButton({
          props: {
            i18n: this.bindings.i18n,
            field: this.facetState?.field,
            facetValue: parentValue,
            onClick: () => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.toggleSelect(parentValue);
            },
          },
        })}
        ${renderCategoryFacetParentAsTreeContainer({
          props: {
            isTopLevel: false,
          },
        })(this.renderValuesTree(parents.slice(1), false))}
      `);
    }

    const activeParent = parents[0];
    const activeParentDisplayValue = getFieldValueCaption(
      this.facetState?.field,
      activeParent.value,
      this.bindings.i18n
    );

    return html`
      ${renderCategoryFacetParentValueLink({
        props: {
          displayValue: activeParentDisplayValue,
          numberOfResults: activeParent.numberOfResults,
          i18n: this.bindings.i18n,
          isLeafValue: activeParent.isLeafValue,
          onClick: () => {
            this.focusTargets.activeValueFocus.focusAfterSearch();
            this.facet.deselectAll();
          },
          searchQuery: this.facetState.facetSearch.query,
          setRef: (el) => {
            this.focusTargets.activeValueFocus.setTarget(el as HTMLElement);
          },
        },
      })(html`
        ${renderCategoryFacetChildrenAsTreeContainer({props: {}})(
          html` ${this.renderChildren()}`
        )}
      `)}
    `;
  }

  private renderChild(
    facetValue: CategoryFacetValue,
    isShowLessFocusTarget: boolean,
    isShowMoreFocusTarget: boolean
  ) {
    const displayValue = getFieldValueCaption(
      this.facetState?.field,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state === 'selected';

    return html`${renderCategoryFacetValueLink({
      props: {
        displayValue,
        numberOfResults: facetValue.numberOfResults,
        i18n: this.bindings.i18n,
        onClick: () => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.toggleSelect(facetValue);
        },
        isParent: false,
        isSelected,
        searchQuery: this.facetState.facetSearch.query,
        isLeafValue: facetValue.isLeafValue,
        setRef: (el) => {
          isShowLessFocusTarget &&
            this.focusTargets.showLessFocus.setTarget(el as HTMLElement);
          isShowMoreFocusTarget &&
            this.focusTargets.showMoreFocus.setTarget(el as HTMLElement);
        },
      },
    })()} `;
  }

  private renderChildren() {
    const {values, selectedValueAncestry, hasActiveValues} = this.facetState;
    const nextValues = hasActiveValues ? selectedValueAncestry : values;

    const children = nextValues?.length
      ? hasActiveValues
        ? nextValues[nextValues.length - 1].children
        : nextValues
      : [];

    return html`${map(children, (value: CategoryFacetValue, i: number) =>
      this.renderChild(value, i === 0, i === this.resultIndexToFocusOnShowMore)
    )}`;
  }

  private renderSearchResults() {
    return renderCategoryFacetSearchResultsContainer()(
      html`${map(this.facetState.facetSearch.values, (value) =>
        renderCategoryFacetSearchValue({
          props: {
            value,
            field: this.facetState.field,
            facetId: this.facetState.facetId,
            searchQuery: this.facetState.facetSearch.query,
            i18n: this.bindings.i18n,
            onClick: () => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.facetSearch.select(value);
            },
          },
        })
      )}`
    );
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

    if (!firstRequestExecuted || hasError || values.length === 0) {
      return html`${nothing}`;
    }

    return renderFacetContainer()(html`
      ${this.renderHeader()}
      ${when(
        !this.isCollapsed,
        () => html`
          ${renderFacetSearchInput({
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
          })}
          ${when(
            shouldDisplaySearchResults(facetSearch),
            () => html`
              ${when(
                facetSearch.values.length > 0,
                () =>
                  renderFacetValuesGroup({
                    props: {
                      i18n,
                      label: this.displayName,
                      query: facetSearch.query,
                    },
                  })(this.renderSearchResults()),
                () => html`<div class="mt-3"></div>`
              )}
              ${renderFacetSearchMatches({
                props: {
                  i18n: this.bindings.i18n,
                  query: this.facetState.facetSearch.query,
                  numberOfMatches: this.facetState.facetSearch.values.length,
                  hasMoreMatches:
                    this.facetState.facetSearch.moreValuesAvailable,
                  showMoreMatches: () =>
                    this.facet.facetSearch.showMoreResults(),
                },
              })}
            `,
            () => html`
              ${renderFacetValuesGroup({
                props: {
                  i18n,
                  label: this.displayName,
                },
              })(
                when(
                  this.hasParents,
                  () => html`
                    ${renderCategoryFacetParentAsTreeContainer({
                      props: {isTopLevel: true, className: 'mt-3'},
                    })(
                      html`${when(
                        selectedValueAncestry,
                        () =>
                          selectedValueAncestry &&
                          this.renderValuesTree(selectedValueAncestry, true)
                      )}`
                    )}
                  `,
                  () => html`
                    ${renderCategoryFacetChildrenAsTreeContainer({
                      props: {
                        className: 'mt-3',
                      },
                    })(this.renderChildren())}
                  `
                )
              )}
              ${this.renderShowMoreLess()}
            `
          )}
        `
      )}
    `);
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
        'The "facet" property is required for <atomic-commerce-category-facet>.'
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-category-facet': AtomicCommerceCategoryFacet;
  }
}
