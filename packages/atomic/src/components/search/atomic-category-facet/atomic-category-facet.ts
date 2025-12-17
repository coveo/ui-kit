import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {
  buildCategoryFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
  type CategoryFacet,
  type CategoryFacetOptions,
  type CategoryFacetSortCriterion,
  type CategoryFacetState,
  type CategoryFacetValue,
  type CategoryFacetValueRequest,
  type FacetConditionsManager,
  type FacetValueRequest,
  type SearchStatus,
  type SearchStatusState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {css, html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import {renderCategoryFacetAllCategoryButton} from '@/src/components/common/facets/category-facet/all-categories-button';
import {renderCategoryFacetChildrenAsTreeContainer} from '@/src/components/common/facets/category-facet/children-as-tree-container';
import {renderCategoryFacetParentAsTreeContainer} from '@/src/components/common/facets/category-facet/parent-as-tree-container';
import {renderCategoryFacetParentButton} from '@/src/components/common/facets/category-facet/parent-button';
import {renderCategoryFacetParentValueLink} from '@/src/components/common/facets/category-facet/parent-value-link';
import {renderCategoryFacetSearchResultsContainer} from '@/src/components/common/facets/category-facet/search-results-container';
import {renderCategoryFacetSearchValue} from '@/src/components/common/facets/category-facet/search-value';
import {renderCategoryFacetTreeValueContainer} from '@/src/components/common/facets/category-facet/value-as-tree-container';
import {renderCategoryFacetValueLink} from '@/src/components/common/facets/category-facet/value-link';
import {parseDependsOn} from '@/src/components/common/facets/depends-on';
import facetCommonStyles from '@/src/components/common/facets/facet-common.tw.css';
import type {FacetInfo} from '@/src/components/common/facets/facet-common-store';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {renderFacetPlaceholder} from '@/src/components/common/facets/facet-placeholder/facet-placeholder';
import facetSearchStyles from '@/src/components/common/facets/facet-search/facet-search.tw.css';
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
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {arrayConverter} from '@/src/converters/array-converter';
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
import {getFieldCaptions, getFieldValueCaption} from '@/src/utils/field-utils';
import {mapProperty} from '@/src/utils/props-utils';

/**
 * The `atomic-category-facet` component displays a facet of values in a browsable, hierarchical fashion.
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
 * @part show-more-less-icon - The icons of the show more and show less buttons.
 */
@customElement('atomic-category-facet')
@bindings()
@withTailwindStyles
export class AtomicCategoryFacet
  extends LitElement
  implements InitializableComponent<Bindings>
{
  private static readonly propsSchema = new Schema({
    field: new StringValue({required: true, emptyAllowed: false}),
    numberOfValues: new NumberValue({min: 1}),
    sortCriteria: new StringValue({
      constrainTo: ['alphanumeric', 'occurrences'],
    }),
    headingLevel: new NumberValue({min: 0, max: 6}),
    injectionDepth: new NumberValue({min: 0}),
    delimitingCharacter: new StringValue(),
  });

  static styles = [
    facetCommonStyles,
    facetSearchStyles,
    css`
      @reference '../../../utils/tailwind.global.tw.css';
      [part~='active-parent'] {
        @apply pl-9;
      }

      [part~='parents'] [part~='values'] {
        @apply pl-9;
      }

      [part~='all-categories-button'],
      [part~='parent-button'] {
        @apply relative flex w-full items-center py-2.5 pr-2 pl-7 text-left;
      }

      [part~='back-arrow'] {
        @apply absolute left-1 h-5 w-5;
      }
    `,
  ];

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  public facet!: CategoryFacet;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;

  private dependenciesManager?: FacetConditionsManager;
  private resultIndexToFocusOnShowMore = 0;

  @bindStateToController('facet')
  @state()
  public facetState!: CategoryFacetState;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;

  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;

  /**
   * Specifies a unique identifier for the facet.
   */
  @property({type: String, reflect: true, attribute: 'facet-id'})
  public facetId?: string;

  /**
   * The non-localized label for the facet.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @property({type: String, reflect: true})
  public label = 'no-label';

  /**
   * The field whose values you want to display in the facet.
   */
  @property({type: String, reflect: true})
  public field!: string;

  /**
   * The tabs on which the facet can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-category-facet tabs-included='["tabIDA", "tabIDB"]'></atomic-category-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet can only be displayed on the specified tabs.
   */
  @property({
    type: Array,
    reflect: true,
    attribute: 'tabs-included',
    converter: arrayConverter,
  })
  public tabsIncluded: string[] = [];

  /**
   * The tabs on which this facet must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-category-facet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-category-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet won't be displayed on any of the specified tabs.
   */
  @property({
    type: Array,
    reflect: true,
    attribute: 'tabs-excluded',
    converter: arrayConverter,
  })
  public tabsExcluded: string[] = [];

  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @property({reflect: true, type: Number, attribute: 'number-of-values'})
  public numberOfValues = 8;

  /**
   * Whether this facet should contain a search box.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'with-search',
    converter: booleanConverter,
  })
  public withSearch = false;

  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'alphanumeric' and 'occurrences'.
   */
  @property({type: String, reflect: true, attribute: 'sort-criteria'})
  public sortCriteria: CategoryFacetSortCriterion = 'occurrences';

  /**
   * The character that separates values of a multi-value field.
   */
  @property({type: String, reflect: true, attribute: 'delimiting-character'})
  public delimitingCharacter = ';';

  /**
   * The base path shared by all values for the facet.
   *
   * Specify the property as an array using a JSON string representation:
   * ```html
   *  <atomic-category-facet base-path='["first value", "second value"]' ></atomic-category-facet>
   * ```
   */
  @property({
    type: Array,
    reflect: true,
    attribute: 'base-path',
    converter: arrayConverter,
  })
  public basePath: string[] = [];

  /**
   * Whether to use basePath as a filter for the results.
   *
   * TODO: KIT-4412 - Deprecate this property and replace with one that defaults to false.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'filter-by-base-path',
    converter: booleanConverter,
  })
  public filterByBasePath = true;

  /**
   * Specifies whether the facet is collapsed.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'is-collapsed',
    converter: booleanConverter,
  })
  public isCollapsed = false;

  /**
   * The heading level to use for the heading over the facet, from 1 to 6.
   */
  @property({reflect: true, type: Number, attribute: 'heading-level'})
  public headingLevel = 0;

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * TODO: KIT-4412 - Deprecate this property and replace with one that defaults to false.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'filter-facet-count',
    converter: booleanConverter,
  })
  public filterFacetCount = true;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   */
  @property({reflect: true, type: Number, attribute: 'injection-depth'})
  public injectionDepth = 1000;

  /**
   * The required facets and values for this facet to be displayed.
   * Examples:
   * ```html
   * <atomic-facet facet-id="abc" field="objecttype" ...></atomic-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-category-facet
   *   depends-on-abc
   *   ...
   * ></atomic-category-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-category-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-category-facet>
   * ```
   */
  @mapProperty({attributePrefix: 'depends-on'})
  public dependsOn!: Record<string, string>;

  private showLessFocus?: FocusTargetController;
  private showMoreFocus?: FocusTargetController;
  private headerFocus?: FocusTargetController;
  private activeValueFocus?: FocusTargetController;

  private facetSearchAriaMessage = new AriaLiveRegionController(
    this,
    'facet-search'
  );

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        field: this.field,
        numberOfValues: this.numberOfValues,
        sortCriteria: this.sortCriteria,
        headingLevel: this.headingLevel,
        injectionDepth: this.injectionDepth,
        delimitingCharacter: this.delimitingCharacter,
      }),
      AtomicCategoryFacet.propsSchema,
      false
    );
  }

  public initialize() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    }

    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);

    const options: CategoryFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      facetSearch: {numberOfValues: this.numberOfValues},
      basePath: this.basePath,
      delimitingCharacter: this.delimitingCharacter,
      filterByBasePath: this.filterByBasePath,
      injectionDepth: this.injectionDepth,
      filterFacetCount: this.filterFacetCount,
      tabs: {
        included: this.tabsIncluded,
        excluded: this.tabsExcluded,
      },
    };

    this.facet = buildCategoryFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;

    announceFacetSearchResultsWithAriaLive(
      this.facet,
      this.label,
      (msg) => {
        this.facetSearchAriaMessage.message = msg;
      },
      this.bindings.i18n
    );

    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.label),
      facetId: this.facetId!,
      element: this,
      isHidden: () => this.isHidden,
    };

    this.bindings.store.registerFacet('categoryFacets', facetInfo);

    initializePopover(this, {
      ...facetInfo,
      hasValues: () => !!this.facet.state.valuesAsTrees.length,
      numberOfActiveValues: () => (this.facetState.hasActiveValues ? 1 : 0),
    });

    this.initializeDependenciesManager();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.dependenciesManager?.stopWatching();
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

  private get isHidden() {
    return (
      this.searchStatusState.hasError ||
      !this.facet.state.enabled ||
      (!this.facet.state.selectedValueAncestry.length &&
        !this.facet.state.valuesAsTrees.length)
    );
  }

  private get hasParents() {
    return !!this.facetState.selectedValueAncestry.length;
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

  private initializeDependenciesManager() {
    if (!this.dependsOn || Object.keys(this.dependsOn).length === 0) {
      return;
    }

    this.dependenciesManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn<
          FacetValueRequest | CategoryFacetValueRequest
        >(this.dependsOn),
      }
    );
  }

  private renderHeader() {
    return renderFacetHeader({
      props: {
        i18n: this.bindings.i18n,
        label: this.label,
        numberOfActiveValues:
          this.facetState.hasActiveValues && this.isCollapsed ? 1 : 0,
        isCollapsed: this.isCollapsed,
        headingLevel: this.headingLevel,
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
    if (!this.withSearch) {
      return nothing;
    }

    return renderFacetSearchInput({
      props: {
        i18n: this.bindings.i18n,
        label: this.label,
        query: this.facetState.facetSearch.query,
        onChange: (value: string) => {
          if (value === '') {
            this.facet.facetSearch.clear();
            return;
          }
          this.facet.facetSearch.updateCaptions(
            getFieldCaptions(this.field, this.bindings.i18n)
          );
          this.facet.facetSearch.updateText(value);
          this.facet.facetSearch.search();
        },
        onClear: () => this.facet.facetSearch.clear(),
      },
    });
  }

  private renderValuesTree(
    valuesAsTrees: CategoryFacetValue[],
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
            facetId: this.facet.state.facetId,
            field: this.field,
            onClick: () => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.deselectAll();
            },
          },
        })}
        ${renderCategoryFacetParentAsTreeContainer({
          props: {
            isTopLevel: false,
          },
        })(this.renderValuesTree(valuesAsTrees, false))}
      `);
    }

    if (valuesAsTrees.length > 1) {
      const parentValue = valuesAsTrees[0];

      return renderCategoryFacetTreeValueContainer()(html`
        ${renderCategoryFacetParentButton({
          props: {
            facetValue: parentValue,
            field: this.field,
            i18n: this.bindings.i18n,
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
        })(this.renderValuesTree(valuesAsTrees.slice(1), false))}
      `);
    }

    const activeParent = valuesAsTrees[0];
    const activeParentDisplayValue = getFieldValueCaption(
      this.field,
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
          this.renderChildren()
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
      this.field,
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
    })()}`;
  }

  private renderChildren(): TemplateResult {
    if (!this.facetState.valuesAsTrees.length) {
      return html``;
    }

    if (this.facetState.selectedValueAncestry.length > 0) {
      const selectedValue = this.facetState.selectedValueAncestry.find(
        (value) => value.state === 'selected'
      );
      if (selectedValue) {
        return html`${map(
          selectedValue.children,
          (value: CategoryFacetValue, i: number) =>
            this.renderChild(
              value,
              i === 0,
              i === this.resultIndexToFocusOnShowMore
            )
        )}`;
      }
    }

    return html`${map(
      this.facetState.valuesAsTrees,
      (value: CategoryFacetValue, i: number) =>
        this.renderChild(
          value,
          i === 0,
          i === this.resultIndexToFocusOnShowMore
        )
    )}`;
  }

  private renderSearchResults() {
    return renderCategoryFacetSearchResultsContainer()(
      html`${map(this.facetState.facetSearch.values, (value) =>
        renderCategoryFacetSearchValue({
          props: {
            value,
            field: this.field,
            facetId: this.facetId,
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

  private renderShowMoreLess() {
    return html`
      <div class=${this.hasParents ? 'pl-9' : ''}>
        ${renderFacetShowMoreLess({
          props: {
            label: this.label,
            i18n: this.bindings.i18n,
            onShowMore: () => {
              const selectedValue = this.facetState.selectedValueAncestry.find(
                (value) => value.state === 'selected'
              );
              this.resultIndexToFocusOnShowMore =
                selectedValue?.children.length ??
                this.facetState.valuesAsTrees.length;
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
    if (!this.facetState || !this.searchStatusState) {
      return html`${nothing}`;
    }

    const {
      bindings: {i18n},
      label,
      facetState: {facetSearch, enabled, valuesAsTrees, selectedValueAncestry},
      searchStatusState: {hasError, firstSearchExecuted},
    } = this;

    if (
      hasError ||
      !enabled ||
      (firstSearchExecuted && !valuesAsTrees.length)
    ) {
      return html`${nothing}`;
    }

    if (!firstSearchExecuted) {
      return html`${renderFacetPlaceholder({
        props: {
          numberOfValues: this.numberOfValues,
          isCollapsed: this.isCollapsed,
        },
      })}`;
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
              ${when(
                facetSearch.values.length > 0,
                () =>
                  renderFacetValuesGroup({
                    props: {
                      i18n,
                      label,
                      query: facetSearch.query,
                    },
                  })(this.renderSearchResults()),
                () => html`<div class="mt-3"></div>`
              )}
              ${this.renderMatches()}
            `,
            () => html`
              ${renderFacetValuesGroup({
                props: {
                  i18n,
                  label,
                },
              })(
                when(
                  this.hasParents,
                  () => html`
                    ${renderCategoryFacetParentAsTreeContainer({
                      props: {isTopLevel: true, className: 'mt-3'},
                    })(this.renderValuesTree(selectedValueAncestry, true))}
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
}
