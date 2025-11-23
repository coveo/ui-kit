import type {
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetValue,
  FacetConditionsManager,
  SearchStatus,
  SearchStatusState,
  TabManager,
  TabManagerState,
} from '@coveo/headless';
import {
  buildCategoryFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
} from '@coveo/headless';
import type {CSSResultGroup, PropertyDeclarations, TemplateResult} from 'lit';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
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
import facetCommonStyles from '@/src/components/common/facets/facet-common.pcss?inline';
import type {FacetInfo} from '@/src/components/common/facets/facet-common-store';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {renderFacetPlaceholder} from '@/src/components/common/facets/facet-placeholder/facet-placeholder';
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
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {arrayPropConverter} from '@/src/converters/array-prop-converter';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {mapPropConverter} from '@/src/converters/map-prop-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import {getFieldCaptions, getFieldValueCaption} from '@/src/utils/field-utils';

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
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 */
@customElement('atomic-category-facet')
@bindings()
export class AtomicCategoryFacet
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = [
    facetCommonStyles as unknown as CSSResultGroup,
  ];

  static shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static properties: PropertyDeclarations = {
    facetId: {type: String, attribute: 'facet-id', reflect: true},
    label: {type: String, reflect: true},
    field: {type: String, reflect: true},
    tabsIncluded: {
      type: Array,
      attribute: 'tabs-included',
      reflect: true,
      converter: arrayPropConverter,
    },
    tabsExcluded: {
      type: Array,
      attribute: 'tabs-excluded',
      reflect: true,
      converter: arrayPropConverter,
    },
    numberOfValues: {
      type: Number,
      attribute: 'number-of-values',
      reflect: true,
    },
    withSearch: {
      type: Boolean,
      attribute: 'with-search',
      reflect: true,
      converter: booleanConverter,
    },
    sortCriteria: {type: String, attribute: 'sort-criteria', reflect: true},
    delimitingCharacter: {
      type: String,
      attribute: 'delimiting-character',
      reflect: true,
    },
    basePath: {
      type: Array,
      attribute: 'base-path',
      reflect: true,
      converter: arrayPropConverter,
    },
    filterByBasePath: {
      type: Boolean,
      attribute: 'filter-by-base-path',
      reflect: true,
      converter: booleanConverter,
    },
    isCollapsed: {
      type: Boolean,
      attribute: 'is-collapsed',
      reflect: true,
      converter: booleanConverter,
    },
    headingLevel: {type: Number, attribute: 'heading-level', reflect: true},
    filterFacetCount: {
      type: Boolean,
      attribute: 'filter-facet-count',
      reflect: true,
      converter: booleanConverter,
    },
    injectionDepth: {type: Number, attribute: 'injection-depth', reflect: true},
    dependsOn: {
      type: Object,
      attribute: 'depends-on',
      converter: mapPropConverter,
    },
  };

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  /**
   * A unique identifier for the facet.
   */
  @property({type: String, attribute: 'facet-id', reflect: true})
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
   * Set this property as a stringified JSON array, e.g.,
   * ```html
   *  <atomic-category-facet tabs-included='["tabIDA", "tabIDB"]'></atomic-category-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet can only be displayed on the specified tabs.
   */
  @property({
    type: Array,
    attribute: 'tabs-included',
    reflect: true,
    converter: arrayPropConverter,
  })
  public tabsIncluded: string[] = [];

  /**
   * The tabs on which this facet must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, e.g.,
   * ```html
   *  <atomic-category-facet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-category-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet won't be displayed on any of the specified tabs.
   */
  @property({
    type: Array,
    attribute: 'tabs-excluded',
    reflect: true,
    converter: arrayPropConverter,
  })
  public tabsExcluded: string[] = [];

  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @property({type: Number, attribute: 'number-of-values', reflect: true})
  public numberOfValues = 8;

  /**
   * Whether this facet should contain a search box.
   */
  @property({
    type: Boolean,
    attribute: 'with-search',
    reflect: true,
    converter: booleanConverter,
  })
  public withSearch = false;

  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'alphanumeric' and 'occurrences'.
   * For this criterion to apply to the top-layer facet values, disable
   * [facet value ordering](https://docs.coveo.com/en/l1qf4156/#facet-value-ordering)
   * in your Dynamic Navigation Experience configuration.
   */
  @property({type: String, attribute: 'sort-criteria', reflect: true})
  public sortCriteria: 'alphanumeric' | 'occurrences' = 'occurrences';

  /**
   * The character that separates values of a multi-value field.
   *
   * *Note:* If you use the [example formatting](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-category-facet/#usage-notes) for the associated multi-value field, you must set this value to `|` or the facet won't display properly.
   */
  @property({type: String, attribute: 'delimiting-character', reflect: true})
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
    attribute: 'base-path',
    reflect: true,
    converter: arrayPropConverter,
  })
  public basePath: string[] = [];

  /**
   * Whether to use basePath as a filter for the results.
   */
  @property({
    type: Boolean,
    attribute: 'filter-by-base-path',
    reflect: true,
    converter: booleanConverter,
  })
  public filterByBasePath = true;

  /**
   * Whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property.
   */
  @property({
    type: Boolean,
    attribute: 'is-collapsed',
    reflect: true,
    converter: booleanConverter,
  })
  public isCollapsed = false;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading over the facet, from 1 to 6.
   */
  @property({type: Number, attribute: 'heading-level', reflect: true})
  public headingLevel = 0;

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   */
  @property({
    type: Boolean,
    attribute: 'filter-facet-count',
    reflect: true,
    converter: booleanConverter,
  })
  public filterFacetCount = true;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @property({type: Number, attribute: 'injection-depth', reflect: true})
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
  @property({
    type: Object,
    attribute: 'depends-on',
    converter: mapPropConverter,
  })
  public dependsOn: Record<string, string> = {};

  @bindStateToController('facet')
  @state()
  public facetState!: CategoryFacetState;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;

  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;

  public facet!: CategoryFacet;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;
  private dependenciesManager?: FacetConditionsManager;
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
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    }

    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);

    const options = {
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

    announceFacetSearchResultsWithAriaLive(
      this.facet,
      this.label,
      (msg) => {
        this.facetSearchAriaMessage.message = msg;
      },
      this.bindings.i18n
    );

    this.facetId = this.facet.state.facetId;

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
    return !!this.facetState.selectedValueAncestry.length;
  }

  private initializeDependenciesManager() {
    this.dependenciesManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn(this.dependsOn),
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
          props: {isTopLevel: false},
        })(html`${this.renderValuesTree(valuesAsTrees, false)}`)}
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
          props: {isTopLevel: false},
        })(html`${this.renderValuesTree(valuesAsTrees.slice(1), false)}`)}
      `);
    }

    const activeParent = valuesAsTrees[0];
    const activeParentDisplayValue = getFieldValueCaption(
      this.field,
      activeParent.value,
      this.bindings.i18n
    );

    return renderCategoryFacetParentValueLink({
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
        setRef: (el: HTMLElement) =>
          this.focusTargets.activeValueFocus.setTarget(el),
      },
    })(
      renderCategoryFacetChildrenAsTreeContainer({props: {}})(
        this.renderChildren()
      )
    );
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

    return renderCategoryFacetValueLink({
      props: {
        displayValue,
        i18n: this.bindings.i18n,
        isLeafValue: facetValue.isLeafValue,
        isSelected,
        numberOfResults: facetValue.numberOfResults,
        onClick: () => {
          this.focusTargets.activeValueFocus.focusAfterSearch();
          this.facet.toggleSelect(facetValue);
        },
        searchQuery: this.facetState.facetSearch.query,
        setRef: (element: HTMLElement) => {
          if (isShowLessFocusTarget) {
            this.focusTargets.showLessFocus.setTarget(element);
          }
          if (isShowMoreFocusTarget) {
            this.focusTargets.showMoreFocus.setTarget(element);
          }
        },
      },
    })();
  }

  private renderChildren() {
    if (!this.facetState.valuesAsTrees.length) {
      return nothing;
    }

    if (this.facetState.selectedValueAncestry.length > 0) {
      const selectedValue = this.facetState.selectedValueAncestry.find(
        (value) => value.state === 'selected'
      );
      if (!selectedValue?.children) {
        return nothing;
      }
      return html`${selectedValue.children.map((value, i) =>
        this.renderChild(
          value,
          i === 0,
          i === this.resultIndexToFocusOnShowMore
        )
      )}`;
    }

    return html`${this.facetState.valuesAsTrees.map((value, i) =>
      this.renderChild(value, i === 0, i === this.resultIndexToFocusOnShowMore)
    )}`;
  }

  private renderSearchResults() {
    return renderCategoryFacetSearchResultsContainer()(html`
      ${this.facetState.facetSearch.values.map((value) =>
        renderCategoryFacetSearchValue({
          props: {
            value,
            field: this.field,
            facetId: this.facetId,
            i18n: this.bindings.i18n,
            searchQuery: this.facetState.facetSearch.query,
            onClick: () => {
              this.focusTargets.activeValueFocus.focusAfterSearch();
              this.facet.facetSearch.select(value);
            },
          },
        })()
      )}
    `);
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
              this.resultIndexToFocusOnShowMore =
                this.facetState.valuesAsTrees[0]?.children?.length ?? 0;
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
      facetState: {facetSearch, enabled, valuesAsTrees, selectedValueAncestry},
      searchStatusState: {hasError, firstSearchExecuted},
    } = this;

    if (
      hasError ||
      !enabled ||
      (firstSearchExecuted &&
        !selectedValueAncestry.length &&
        !valuesAsTrees.length)
    ) {
      return html`${nothing}`;
    }

    if (!firstSearchExecuted) {
      return renderFacetPlaceholder({
        props: {
          isCollapsed: this.isCollapsed,
          numberOfValues: this.numberOfValues,
        },
      });
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
                      label: this.label,
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
                  label: this.label,
                },
              })(
                when(
                  this.hasParents,
                  () => html`
                    ${renderCategoryFacetParentAsTreeContainer({
                      props: {isTopLevel: true, className: 'mt-3'},
                    })(
                      html`${this.renderValuesTree(selectedValueAncestry, true)}`
                    )}
                  `,
                  () => html`
                    ${renderCategoryFacetChildrenAsTreeContainer({
                      props: {className: 'mt-3'},
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

declare global {
  interface HTMLElementTagNameMap {
    'atomic-category-facet': AtomicCategoryFacet;
  }
}
