import {ArrayValue, NumberValue, Schema, StringValue} from '@coveo/bueno';
import {
  buildFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
  type CategoryFacetValueRequest,
  type Facet,
  type FacetConditionsManager,
  type FacetOptions,
  type FacetResultsMustMatch,
  type FacetSortCriterion,
  type FacetState,
  type FacetValueRequest,
  type SearchStatus,
  type SearchStatusState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from '@/src/utils/accessibility-utils';
import {mapProperty} from '@/src/utils/props-utils';
import {getFieldCaptions} from '../../../utils/field-utils';
import {parseDependsOn} from '../../common/facets/depends-on';
import type {FacetInfo} from '../../common/facets/facet-common-store';
import {renderFacetContainer} from '../../common/facets/facet-container/facet-container';
import {renderFacetHeader} from '../../common/facets/facet-header/facet-header';
import {announceFacetSearchResultsWithAriaLive} from '../../common/facets/facet-search/facet-search-aria-live';
import {renderFacetSearchInput} from '../../common/facets/facet-search/facet-search-input';
import {facetSearchInputGuard} from '../../common/facets/facet-search/facet-search-input-guard';
import {renderFacetSearchMatches} from '../../common/facets/facet-search/facet-search-matches';
import {
  shouldDisplaySearchResults,
  shouldUpdateFacetSearchComponent,
} from '../../common/facets/facet-search/facet-search-utils';
import {renderFacetShowMoreLess} from '../../common/facets/facet-show-more-less/facet-show-more-less';
import {
  type FacetValueProps,
  renderFacetValue,
} from '../../common/facets/facet-value/facet-value';
import {renderFacetValuesGroup} from '../../common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '../../common/facets/popover/popover-type';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';
import '../../common/atomic-facet-placeholder/atomic-facet-placeholder';
import {arrayConverter} from '@/src/converters/array-converter';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindings} from '@/src/decorators/bindings';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import facetCommonStyles from '../../common/facets/facet-common.tw.css';
import facetSearchStyles from '../../common/facets/facet-search/facet-search.tw.css';
import facetValueBoxStyles from '../../common/facets/facet-value-box/facet-value-box.tw.css';
import facetValueCheckboxStyles from '../../common/facets/facet-value-checkbox/facet-value-checkbox.tw.css';
import facetValueExcludeStyles from '../../common/facets/facet-value-exclude/facet-value-exclude.tw.css';
import {ValidatePropsController} from '../../common/validate-props-controller/validate-props-controller';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (for example, number of occurrences).
 * An `atomic-facet` displays a facet of the results for the current query.
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
 * @part show-more-less-icon - The icons of the show more and show less buttons.
 */
@customElement('atomic-facet')
@bindings()
@withTailwindStyles
export class AtomicFacet
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  static styles = [
    facetCommonStyles,
    facetSearchStyles,
    facetValueCheckboxStyles,
    facetValueExcludeStyles,
    facetValueBoxStyles,
  ];

  @state() bindings!: Bindings;
  public facet!: Facet;
  public searchStatus!: SearchStatus;
  public tabManager!: TabManager;

  @bindStateToController('facet')
  @state()
  public facetState!: FacetState;
  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;
  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;
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
  @property({type: String, reflect: true}) public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @property({type: String, reflect: true}) public field!: string;
  /**
   * The tabs on which the facet can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-facet tabs-included='["tabIDA", "tabIDB"]'></atomic-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet can only be displayed on the specified tabs.
   */
  @property({
    type: Array,
    attribute: 'tabs-included',
    converter: arrayConverter,
    reflect: true,
  })
  public tabsIncluded: string[] = [];

  /**
   * The tabs on which this facet must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-facet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-facet>
   * ```
   * If you don't set this property, the facet can be displayed on any tab. Otherwise, the facet won't be displayed on any of the specified tabs.
   */
  @property({
    type: Array,
    attribute: 'tabs-excluded',
    converter: arrayConverter,
    reflect: true,
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
   *
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    attribute: 'with-search',
    reflect: true,
  })
  public withSearch = true;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric', 'alphanumericDescending', 'occurrences', alphanumericNatural', 'alphanumericNaturalDescending' and 'automatic'.
   */
  @property({type: String, attribute: 'sort-criteria', reflect: true})
  public sortCriteria: FacetSortCriterion = 'automatic';
  /**
   * Specifies how a result must match the selected facet values.
   * Allowed values:
   * - `atLeastOneValue`: A result will match if at least one of the corresponding facet values is selected.
   * - `allValues`: A result will match if all corresponding facet values are selected.
   */
  @property({type: String, attribute: 'results-must-match', reflect: true})
  public resultsMustMatch: FacetResultsMustMatch = 'atLeastOneValue';
  /**
   * Whether to display the facet values as checkboxes (multiple selection), links (single selection) or boxes (multiple selection).
   * Possible values are 'checkbox', 'link', and 'box'.
   */
  @property({type: String, attribute: 'display-values-as', reflect: true})
  public displayValuesAs: 'checkbox' | 'link' | 'box' = 'checkbox';
  /**
   * Whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    attribute: 'is-collapsed',
    reflect: true,
  })
  public isCollapsed = false;
  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading over the facet, from 1 to 6.
   */
  @property({type: Number, attribute: 'heading-level'})
  public headingLevel = 0;
  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    attribute: 'filter-facet-count',
    reflect: true,
  })
  public filterFacetCount = true;
  /**
   * Whether to allow excluding values from the facet.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    attribute: 'enable-exclusion',
    reflect: true,
  })
  public enableExclusion = false;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @property({type: Number, attribute: 'injection-depth'})
  public injectionDepth = 1000;

  /**
   * The required facets and values for this facet to be displayed.
   * Examples:
   * ```html
   * <atomic-facet facet-id="abc" field="objecttype" ...></atomic-facet>
   *
   * <!-- To show the facet when any value is selected in the facet with id "abc": -->
   * <atomic-facet
   *   depends-on-abc
   *   ...
   * ></atomic-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-facet>
   * ```
   */
  @mapProperty({attributePrefix: 'depends-on'})
  public dependsOn!: Record<string, string>;
  /**
   * An explicit list of `allowedValues` in the Search API request, as a JSON string representation.
   *
   * If you specify a list of values for this option, the facet uses only these values (if they are available in
   * the current result set).
   *
   * Example:
   *
   * The following facet only uses the `Contact`, `Account`, and `File` values of the `objecttype` field. Even if the
   * current result set contains other `objecttype` values, such as `Message`, or `Product`, the facet does not use
   * those other values.
   *
   * ```html
   * <atomic-facet field="objecttype" allowed-values='["Contact","Account","File"]'></atomic-facet>
   * ```
   *
   * The maximum amount of allowed values is 25.
   *
   * Default value is `undefined`, and the facet uses all available values for its `field` in the current result set.
   */
  @property({
    type: Array,
    attribute: 'allowed-values',
  })
  public allowedValues: string[] | string = [];

  /**
   * The facet values that must appear at the top, in the specified.
   * This parameter can be used in conjunction with the `sortCriteria` parameter.
   *
   * Facet values not part of the `customSort` list will be sorted according to the `sortCriteria`.
   *
   * Example:
   *
   * The following facet will sort the `Contact`, `Account`, and `File` values at the top of the list for the `objecttype` field.
   *
   * If there are more than these 3 values available, the rest of the list will be sorted using `occurrences`.
   *
   * ```html
   * <atomic-facet field="objecttype" custom-sort='["Contact","Account","File"]' sort-criteria='occurrences'></atomic-facet>
   * ```
   * The maximum amount of custom sort values is 25.
   *
   * The default value is `undefined`, and the facet values will be sorted using only the `sortCriteria`.
   */
  @property({
    type: Array,
    attribute: 'custom-sort',
  })
  public customSort: string[] | string = [];

  private showLessFocus?: FocusTargetController;
  private showMoreFocus?: FocusTargetController;
  private headerFocus?: FocusTargetController;
  private facetConditionsManager?: FacetConditionsManager;
  private facetSearchAriaLive?: AriaLiveRegionController;

  constructor() {
    super();
    new ValidatePropsController(
      this,
      () => ({
        field: this.field,
        numberOfValues: this.numberOfValues,
        headingLevel: this.headingLevel,
        injectionDepth: this.injectionDepth,
        sortCriteria: this.sortCriteria,
        resultsMustMatch: this.resultsMustMatch,
        displayValuesAs: this.displayValuesAs,
        allowedValues: Array.isArray(this.allowedValues)
          ? this.allowedValues
          : [],
        customSort: Array.isArray(this.customSort) ? this.customSort : [],
        tabsExcluded: this.tabsExcluded,
        tabsIncluded: this.tabsIncluded,
      }),
      new Schema({
        field: new StringValue({required: true, emptyAllowed: false}),
        numberOfValues: new NumberValue({min: 1, required: false}),
        headingLevel: new NumberValue({min: 0, max: 6, required: false}),
        injectionDepth: new NumberValue({min: 0, required: false}),
        sortCriteria: new StringValue({
          constrainTo: [
            'score',
            'alphanumeric',
            'alphanumericDescending',
            'occurrences',
            'alphanumericNatural',
            'alphanumericNaturalDescending',
            'automatic',
          ],
          required: false,
        }),
        resultsMustMatch: new StringValue({
          constrainTo: ['atLeastOneValue', 'allValues'],
          required: false,
        }),
        displayValuesAs: new StringValue({
          constrainTo: ['checkbox', 'link', 'box'],
          required: false,
        }),
        allowedValues: new ArrayValue({
          each: new StringValue({emptyAllowed: false}),
          max: 25,
          required: false,
        }),
        customSort: new ArrayValue({
          each: new StringValue({emptyAllowed: false}),
          max: 25,
          required: false,
        }),
        tabsExcluded: new ArrayValue({
          each: new StringValue({emptyAllowed: false}),
          required: false,
        }),
        tabsIncluded: new ArrayValue({
          each: new StringValue({emptyAllowed: false}),
          required: false,
        }),
      })
    );
  }

  public initialize() {
    if (
      [...this.tabsIncluded].length > 0 &&
      [...this.tabsExcluded].length > 0
    ) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This is could lead to unexpected behaviors.'
      );
    }

    if (this.displayValuesAs !== 'checkbox' && this.enableExclusion) {
      console.warn(
        'The "enableExclusion" property is only available when "displayValuesAs" is set to "checkbox".'
      );
    }

    this.facet = buildFacet(this.bindings.engine, {options: this.facetOptions});
    this.facetId = this.facet.state.facetId;
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);
    this.initAriaLive();
    this.initConditionManager();
    this.initPopover();
    this.registerFacet();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.facetConditionsManager?.stopWatching();
  }

  public shouldUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('facetState')) {
      const currentFacetState = this.facetState;
      const previousFacetState = changedProperties.get(
        'facetState'
      ) as FacetState;

      if (previousFacetState && currentFacetState) {
        return shouldUpdateFacetSearchComponent(
          currentFacetState.facetSearch,
          previousFacetState.facetSearch
        );
      }
    }
    return super.shouldUpdate(changedProperties);
  }

  private shouldRenderFacet() {
    return (
      !this.searchStatusState.hasError &&
      this.facetState.enabled &&
      (!this.searchStatusState.firstSearchExecuted ||
        this.facetState.values.length > 0)
    );
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.shouldRenderFacet(), () =>
      this.searchStatusState.firstSearchExecuted
        ? renderFacetContainer()(
            html`
            ${this.renderFacetHeader()}
            ${this.renderBody()}
          `
          )
        : html`<atomic-facet-placeholder
          value-count="${this.numberOfValues}"
        ></atomic-facet-placeholder>`
    )}`;
  }

  private renderFacetHeader() {
    return html`${renderFacetHeader({
      props: {
        i18n: this.bindings.i18n,
        label: this.definedLabel,
        onClearFilters: () => {
          this.focusTargets.header.focusAfterSearch();
          this.facet.deselectAll();
        },
        numberOfActiveValues: this.activeValues.length,
        isCollapsed: this.isCollapsed,
        headingLevel: this.headingLevel,
        onToggleCollapse: () => {
          this.isCollapsed = !this.isCollapsed;
        },
        headerRef: (el) => this.focusTargets.header.setTarget(el),
      },
    })}`;
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
          withSearch: this.withSearch,
        },
        () =>
          renderFacetSearchInput({
            props: {
              i18n: this.bindings.i18n,
              label: this.definedLabel,
              onChange: (value) => {
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
              query: this.facetState.facetSearch.query,
            },
          })
      )}
      ${
        shouldDisplaySearchResults(this.facetState.facetSearch)
          ? html`${this.renderSearchResults()}${this.renderMatches()}`
          : html`${this.renderValues()}${this.renderShowMoreLess()}`
      }
    `;
  }

  private renderValuesContainer(children: unknown[], query?: string) {
    const classes = `mt-3 ${
      this.displayValuesAs === 'box' ? 'box-container' : ''
    }`;
    return renderFacetValuesGroup({
      props: {
        i18n: this.bindings.i18n,
        label: this.label,
        query,
      },
    })(
      html`<ul class="${classes}" part="values">
        ${children}
      </ul>`
    );
  }

  private renderSearchResults() {
    return this.renderValuesContainer(
      this.facet.state.facetSearch.values.map((value) =>
        renderFacetValue({
          props: {
            ...this.facetValueProps,
            facetState: 'idle',
            facetCount: value.count,
            onExclude: () => this.facet.facetSearch.exclude(value),
            onSelect: () =>
              this.displayValuesAs === 'link'
                ? this.facet.facetSearch.singleSelect(value)
                : this.facet.facetSearch.select(value),
            facetValue: value.rawValue,
          },
        })
      )
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

        return renderFacetValue({
          props: {
            ...this.facetValueProps,
            facetCount: value.numberOfResults,
            onExclude: () => this.facet.toggleExclude(value),
            onSelect: () =>
              this.displayValuesAs === 'link'
                ? this.facet.toggleSingleSelect(value)
                : this.facet.toggleSelect(value),
            facetValue: value.value,
            facetState: value.state,
            setRef: (btn) => {
              if (shouldFocusOnShowLessAfterInteraction) {
                this.showLessFocus?.setTarget(btn as HTMLElement);
              }
              if (shouldFocusOnShowMoreAfterInteraction) {
                this.showMoreFocus?.setTarget(btn as HTMLElement);
              }
            },
          },
        });
      })
    );
  }

  private renderShowMoreLess() {
    return renderFacetShowMoreLess({
      props: {
        label: this.label,
        i18n: this.bindings.i18n,
        onShowMore: () => {
          this.focusTargets.showMore.focusAfterSearch();
          this.facet.showMoreValues();
        },
        onShowLess: () => {
          this.focusTargets.showLess.focusAfterSearch();
          this.facet.showLessValues();
        },
        canShowMoreValues: this.facet.state.canShowMoreValues,
        canShowLessValues: this.facet.state.canShowLessValues,
      },
    });
  }

  private renderMatches() {
    return renderFacetSearchMatches({
      props: {
        i18n: this.bindings.i18n,
        query: this.facet.state.facetSearch.query,
        numberOfMatches: this.facet.state.facetSearch.values.length,
        hasMoreMatches: this.facet.state.facetSearch.moreValuesAvailable,
        showMoreMatches: () => this.facet.facetSearch.showMoreResults(),
      },
    });
  }

  private get activeValues() {
    return this.facet.state.values.filter(({state}) => state !== 'idle');
  }

  private get facetOptions(): FacetOptions {
    return {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      resultsMustMatch: this.resultsMustMatch,
      facetSearch: {numberOfValues: this.numberOfValues},
      filterFacetCount: this.filterFacetCount,
      injectionDepth: this.injectionDepth,
      allowedValues: this.allowedValues.length
        ? [...this.allowedValues]
        : undefined,
      customSort: this.customSort.length ? [...this.customSort] : undefined,
      tabs: {
        included: [...this.tabsIncluded],
        excluded: [...this.tabsExcluded],
      },
    };
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

  private get isHidden() {
    return !this.facet.state.enabled || !this.facet.state.values.length;
  }

  private get host() {
    return this;
  }

  private initConditionManager() {
    this.facetConditionsManager = buildFacetConditionsManager(
      this.bindings.engine,
      {
        facetId: this.facetId!,
        conditions: parseDependsOn<
          FacetValueRequest | CategoryFacetValueRequest
        >(this.dependsOn || {}),
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
    this.facetSearchAriaLive = new AriaLiveRegionController(
      this,
      'facet-search'
    );
    announceFacetSearchResultsWithAriaLive(
      this.facet,
      this.label,
      (msg) => {
        this.facetSearchAriaLive!.message = msg;
      },
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
      this.showLessFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.showMoreFocus) {
      this.showMoreFocus = new FocusTargetController(this, this.bindings);
    }
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }

    return {
      showLess: this.showLessFocus,
      showMore: this.showMoreFocus,
      header: this.headerFocus,
    };
  }
}
