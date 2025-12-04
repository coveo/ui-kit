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
  type FacetValue,
  type FacetValueRequest,
  type SearchStatus,
  type SearchStatusState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {parseDependsOn} from '@/src/components/common/facets/depends-on';
import facetCommonStyles from '@/src/components/common/facets/facet-common.tw.css';
import type {FacetInfo} from '@/src/components/common/facets/facet-common-store';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {renderFacetPlaceholder} from '@/src/components/common/facets/facet-placeholder/facet-placeholder';
import facetSearchStyles from '@/src/components/common/facets/facet-search/facet-search.tw.css';
import {announceFacetSearchResultsWithAriaLive} from '@/src/components/common/facets/facet-search/facet-search-aria-live';
import {renderFacetSearchInput} from '@/src/components/common/facets/facet-search/facet-search-input';
import {facetSearchInputGuard} from '@/src/components/common/facets/facet-search/facet-search-input-guard';
import {renderFacetSearchMatches} from '@/src/components/common/facets/facet-search/facet-search-matches';
import {
  shouldDisplaySearchResults,
  shouldUpdateFacetSearchComponent,
} from '@/src/components/common/facets/facet-search/facet-search-utils';
import {renderFacetShowMoreLess} from '@/src/components/common/facets/facet-show-more-less/facet-show-more-less';
import {renderFacetValueBox} from '@/src/components/common/facets/facet-value-box/facet-value-box';
import facetValueBoxStyles from '@/src/components/common/facets/facet-value-box/facet-value-box.tw.css';
import {renderFacetValueLabelHighlight} from '@/src/components/common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import {initializePopover} from '@/src/components/common/facets/popover/popover-type';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {renderColorFacetCheckbox} from '@/src/components/search/facets/color-facet-checkbox/color-facet-checkbox';
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
 * The `atomic-color-facet` component displays facet values as color boxes or checkboxes with color indicators.
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
 * @part default-color-value - The default part name used to customize color facet values. Should be defined before dynamic parts.
 * @part value-* - The dynamic part name used to customize a facet value. The `*` is a syntactical placeholder for a specific facet value. For example, if the component's `field` property is set to 'filetype' and your source has a `YouTubeVideo` file type, the part would be targeted like this: `atomic-color-facet::part(value-YouTubeVideo)...`.
 *
 * @part value-box - The facet value when display is 'box'.
 * @part value-box-selected - The selected facet value when display is 'box'.
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-checked - The checked facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 *
 * @cssprop --atomic-facet-color-boxes-per-row - The number of color boxes displayed per row when display is 'box'.
 * @cssprop --atomic-facet-color-boxes-gap - The gap between color boxes when display is 'box'.
 */
@customElement('atomic-color-facet')
@bindings()
@withTailwindStyles
export class AtomicColorFacet
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles = [
    facetCommonStyles,
    facetSearchStyles,
    facetValueBoxStyles,
    css`
      .box-color-container {
        display: grid;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        grid-template-columns: repeat(
            var(--atomic-facet-color-boxes-per-row, 3),
            minmax(0, 1fr)
          );
        gap: var(--atomic-facet-color-boxes-gap, 0.5rem);
      }

      .value-box-color {
        background-color: var(--atomic-neutral-dark);
        margin-bottom: 0.5rem;
        height: 3rem;
        width: 100%;
        border-radius: 0.375rem;
      }
    `,
  ];

  @state() public bindings!: Bindings;
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
   * Set this property as a stringified JSON array, for example,
   * ```html
   *  <atomic-color-facet tabs-included='["tabIDA", "tabIDB"]'></atomic-color-facet>
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
   * Set this property as a stringified JSON array, for example,
   * ```html
   *  <atomic-color-facet tabs-excluded='["tabIDA", "tabIDB"]'></atomic-color-facet>
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
   * Whether to display the facet values as checkboxes (multiple selection) or boxes (multiple selection).
   * Possible values are 'checkbox', and 'box'.
   */
  @property({type: String, attribute: 'display-values-as', reflect: true})
  public displayValuesAs: 'checkbox' | 'box' = 'box';
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
  @property({type: Number, attribute: 'heading-level', reflect: true})
  public headingLevel = 0;
  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
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
   * <atomic-color-facet
   *   depends-on-abc
   *   ...
   * ></atomic-color-facet>
   *
   * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
   * <atomic-color-facet
   *   depends-on-abc="doc"
   *   ...
   * ></atomic-color-facet>
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
   * current result set contains other `objecttype` values, such as `Message` or `Product`, the facet does not use
   * them.
   *
   * ```html
   * <atomic-color-facet field="objecttype" allowed-values='["Contact","Account","File"]'></atomic-color-facet>
   * ```
   *
   * The maximum amount of allowed values is 25.
   *
   * The default value is `undefined`, and the facet uses all available values for its `field` in the current result set.
   */
  @property({
    type: Array,
    attribute: 'allowed-values',
    converter: arrayConverter,
  })
  public allowedValues: string[] = [];

  /**
   * The facet values that must appear at the top, in the specified order.
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
   * <atomic-color-facet field="objecttype" custom-sort='["Contact","Account","File"]' sort-criteria='occurrences'></atomic-color-facet>
   * ```
   * The maximum amount of custom sort values is 25.
   *
   * The default value is `undefined`, and the facet values will be sorted using only the `sortCriteria`.
   */
  @property({
    type: Array,
    attribute: 'custom-sort',
    converter: arrayConverter,
  })
  public customSort: string[] = [];

  private showLessFocus?: FocusTargetController;
  private showMoreFocus?: FocusTargetController;
  private headerFocus?: FocusTargetController;
  private facetConditionsManager?: FacetConditionsManager;
  private facetSearchAriaLive?: AriaLiveRegionController;
  private resultIndexToFocusOnShowMore = 0;

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
          constrainTo: ['checkbox', 'box'],
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
      }),
      false
    );
  }

  public initialize() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This is could lead to unexpected behaviors.'
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
    if (changedProperties.has('facetState') && this.withSearch) {
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
      this.searchStatusState &&
      !this.searchStatusState.hasError &&
      this.facetState &&
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
        : renderFacetPlaceholder({
            props: {
              numberOfValues: this.numberOfValues,
              isCollapsed: this.isCollapsed,
            },
          })
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

  private renderValue(
    facetValue: FacetValue,
    onClick: () => void,
    isShowLessFocusTarget: boolean,
    isShowMoreFocusTarget: boolean
  ) {
    const displayValue = getFieldValueCaption(
      this.facetId!,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state === 'selected';
    const isExcluded = facetValue.state === 'excluded';
    const partValueWithDisplayValue = displayValue.replace(/[^a-z0-9]/gi, '');
    const partValueWithAPIValue = facetValue.value.replace(/[^a-z0-9]/gi, '');

    const buttonRef = (element: Element | undefined) => {
      if (!element) return;
      if (isShowLessFocusTarget) {
        this.focusTargets.showLess.setTarget(element as HTMLElement);
      }
      if (isShowMoreFocusTarget) {
        this.focusTargets.showMore.setTarget(element as HTMLElement);
      }
    };

    switch (this.displayValuesAs) {
      case 'checkbox':
        return renderColorFacetCheckbox({
          props: {
            displayValue,
            numberOfResults: facetValue.numberOfResults,
            isSelected,
            i18n: this.bindings.i18n,
            onClick,
            buttonRef,
          },
        })(
          renderFacetValueLabelHighlight({
            props: {
              displayValue,
              isSelected,
              searchQuery: this.facetState.facetSearch.query,
            },
          })
        );
      case 'box':
        return renderFacetValueBox({
          props: {
            displayValue,
            numberOfResults: facetValue.numberOfResults,
            isSelected,
            i18n: this.bindings.i18n,
            onClick,
            searchQuery: this.facetState.facetSearch.query,
            buttonRef,
          },
        })(
          html`
            <div
              part="value-${partValueWithDisplayValue} value-${partValueWithAPIValue} default-color-value"
              class="value-box-color"
            ></div>
            ${renderFacetValueLabelHighlight({
              props: {
                displayValue,
                isSelected,
                isExcluded,
                searchQuery: this.facetState.facetSearch.query,
              },
            })}
          `
        );
    }
  }

  private renderValuesContainer(children: unknown[], query?: string) {
    const classes = `mt-3 ${
      this.displayValuesAs === 'box' ? 'box-color-container' : ''
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
        this.renderValue(
          {
            state: 'idle',
            numberOfResults: value.count,
            value: value.rawValue,
          },
          () => this.facet.facetSearch.select(value),
          false,
          false
        )
      ),
      this.facetState.facetSearch.query
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
            : this.resultIndexToFocusOnShowMore);

        return this.renderValue(
          value,
          () => this.facet.toggleSelect(value),
          shouldFocusOnShowLessAfterInteraction,
          shouldFocusOnShowMoreAfterInteraction
        );
      })
    );
  }

  private renderShowMoreLess() {
    return renderFacetShowMoreLess({
      props: {
        label: this.label,
        i18n: this.bindings.i18n,
        onShowMore: () => {
          this.resultIndexToFocusOnShowMore = this.facet.state.values.length;
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
      allowedValues: this.allowedValues.length ? this.allowedValues : undefined,
      customSort: this.customSort.length ? this.customSort : undefined,
      tabs: {
        included: this.tabsIncluded,
        excluded: this.tabsExcluded,
      },
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

declare global {
  interface HTMLElementTagNameMap {
    'atomic-color-facet': AtomicColorFacet;
  }
}
