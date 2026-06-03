import allCategories from '@salesforce/label/c.quantic_AllCategories';
import clear from '@salesforce/label/c.quantic_Clear';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';
import moreMatchesFor from '@salesforce/label/c.quantic_MoreMatchesFor';
import noMatchesFor from '@salesforce/label/c.quantic_NoMatchesFor';
import search from '@salesforce/label/c.quantic_Search';
import showLess from '@salesforce/label/c.quantic_ShowLess';
import showLessFacetValues from '@salesforce/label/c.quantic_ShowLessFacetValues';
import showMore from '@salesforce/label/c.quantic_ShowMore';
import showMoreFacetValues from '@salesforce/label/c.quantic_ShowMoreFacetValues';
import {
  registerComponentForInit,
  initializeWithHeadless,
  registerToStore,
  getHeadlessBundle,
  getBueno,
} from 'c/quanticHeadlessLoader';
import {
  I18nUtils,
  generateFacetDependencyConditions,
  regexEncode,
  Store,
} from 'c/quanticUtils';
import {api, LightningElement, track} from 'lwc';

/** @typedef {import("coveo").CategoryFacet} CategoryFacet */
/** @typedef {import("coveo").CategoryFacetState} CategoryFacetState */
/** @typedef {import("coveo").CategoryFacetValue} CategoryFacetValue */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").FacetConditionsManager} FacetConditionsManager */
/** @typedef {import('../quanticUtils/facetDependenciesUtils').DependsOn} DependsOn */
/**
 * @typedef FocusTarget
 * @type {object}
 * @property {'facetValue' | 'facetHeader'} type
 */
/**
 * @typedef CaptionProvider
 * @type {object}
 * @property {Record<string, string>} captions
 */

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criterion (for example, number of occurrences).
 * A `QuanticCategoryFacet` displays field values in a browsable, hierarchical fashion.
 * Custom captions can be provided by adding caption provider components to the `captions` named slot.
 * See [Create a custom caption provider component for Quantic facets](https://docs.coveo.com/en/quantic/latest/usage/create-custom-caption-provider-component/).
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-category-facet engine-id={engineId} facet-id="myfacet" field="geographicalhierarchy" label="Country" base-path="Africa,Togo,Lome" no-filter-by-base-path delimiting-character="/" number-of-values="5" is-collapsed></c-quantic-category-facet>
 *
 * @example
 * <c-quantic-category-facet engine-id={engineId} field="geographicalhierarchy">
 *   <c-quantic-facet-caption slot="captions" value="United States" caption="United States of America"></c-quantic-facet-caption>
 *   <c-quantic-facet-caption slot="captions" value="usa" caption="USA"></c-quantic-facet-caption>
 * </c-quantic-facet>
 */
export default class QuanticCategoryFacet extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * A unique identifier for the facet.
   * Defaults to the `field` value.
   * @api
   * @type {string}
   * @defaultValue Defaults to the `field` value.
   */
  @api facetId;
  /**
   * The field whose values you want to display in the facet.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * The non-localized label for the facet. This label is displayed in the facet header.
   * @api
   * @type {string}
   */
  @api label = 'no-label';
  /**
   * The base path shared by all facet values, separated by commas.
   * @api
   * @type {string}
   * @defaultValue `''`
   */
  @api basePath = '';
  /**
   * Whether not to use the `basePath` as a filter for the results.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api noFilterByBasePath = false;
  /**
   * Whether not to exclude the parents of folded results when estimating the result count for each facet value.
   * @api
   * @type {boolean}
   * @defaultValue `false
   */
  @api noFilterFacetCount = false;
  /**
   * The character that separates the values of the target multi-value field.
   * If the field is defined as "hierarchical", parts of a path are delimited by `;`. A value is indexed as `parent;child` and `delimitingCharacter` should be set to `;`.
   * @api
   * @type {string}
   * @defaultValue `;`
   */
  @api delimitingCharacter = ';';
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   * @api
   * @type {number}
   * @defaultValue `8`
   */
  @api numberOfValues = 8;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are:
   *   - `alphanumeric`: Filters are sorted in alphanumerical order.
   *   - `occurrences`: Filters are sorted in descending order of number of occurrences.
   * @api
   * @type {'alphanumeric' | 'occurrences'}
   * @defaultValue `'occurrences'`
   */
  @api sortCriteria = 'occurrences';
  /**
   * Whether this facet should contain a search box.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api withSearch = false;
  /**
   * This property defines the relationship between this facet and a parent facet, indicating
   * the specific parent facet that this facet relies on and the selected value required
   * from that parent facet for this facet to be displayed.
   *
   * When this property is defined, the facet will only display if the specified `parentFacetId`
   * has the `expectedValue` selected. If `expectedValue` is omitted or set to `undefined`,
   * the facet will display as long as any value is selected in the parent facet.
   *
   * **Supported facets:** Dependencies can only be created on a basic or category facet.
   * Dependencies on numeric, timeframe, or date facets are not supported.
   *
   * For example usage and more details, see:
   * https://docs.coveo.com/en/quantic/latest/usage/display-facet-based-on-selection-of-another-facet/
   *
   * @api
   * @type {DependsOn}
   */
  @api dependsOn;
  /**
   * Whether the facet is collapsed.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(collapsed) {
    this._isCollapsed = collapsed;
  }
  /** @type {boolean} */
  _isCollapsed = false;
  static attributes = [
    'facetId',
    'field',
    'label',
    'basePath',
    'noFilterByBasePath',
    'noFilterFacetCount',
    'delimitingCharacter',
    'numberOfValues',
    'sortCriteria',
    'withSearch',
    'dependsOn',
  ];
  /** @type {CategoryFacetState} */
  @track state;
  /** @type {CategoryFacet} */
  facet;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {boolean} */
  showPlaceholder = true;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;
  /** @type {string} */
  collapseIconName = 'utility:dash';
  /** @type {HTMLInputElement} */
  input;
  /** @type {AnyHeadless} */
  headless;
  /** @type {FocusTarget} */
  focusTarget;
  /** @type {boolean} */
  focusShouldBeInFacet = false;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {FacetConditionsManager} */
  categoryFacetConditionsManager;

  labels = {
    clear,
    showMore,
    showLess,
    showMoreFacetValues,
    showLessFacetValues,
    allCategories,
    search,
    moreMatchesFor,
    noMatchesFor,
    collapseFacet,
    expandFacet,
  };

  /** @type {object} */
  customCaptions = {};
  /** @type {Function} */
  remoteGetValueCaption;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.remoteGetValueCaption = (item) => this.translateValue(item.value);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    this.input = this.template.querySelector('.facet__searchbox-input');
    if (this.focusShouldBeInFacet && !this.facet?.state?.isLoading) {
      this.setFocusOnTarget();
      this.focusTarget = null;
    }
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
    this.categoryFacetConditionsManager?.stopWatching();
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );
    this.customCaptions = this.loadCustomCaptions();

    if (
      this.sortCriteria === 'alphanumeric' &&
      Object.keys(this.customCaptions).length > 0
    ) {
      console.warn(
        'The Quantic Category Facet component should not be used with custom captions and alphanumeric sorting simultaneously. The values might appear in the wrong order.'
      );
    }

    this.facet = this.headless.buildCategoryFacet(engine, {
      options: {
        field: this.field,
        facetId: this.facetId ?? this.field,
        facetSearch: this.withSearch
          ? {
              captions: this.customCaptions,
              numberOfValues: Number(this.numberOfValues),
            }
          : undefined,
        delimitingCharacter: this.delimitingCharacter,
        basePath: this.basePath?.length ? this.basePath.split(',') : [],
        filterByBasePath: !this.noFilterByBasePath,
        filterFacetCount: !this.noFilterFacetCount,
        numberOfValues: Number(this.numberOfValues),
        sortCriteria: this.sortCriteria,
      },
    });
    if (this.dependsOn) {
      this.validateDependsOnProperty();
      this.initFacetConditionManager(engine);
    }
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
    registerToStore(this.engineId, Store.facetTypes.CATEGORYFACETS, {
      label: this.label,
      facetId: this.facet.state.facetId,
      format: this.remoteGetValueCaption,
      element: this.template.host,
      metadata: {
        customCaptions: Object.entries(this.customCaptions).map(
          ([key, label]) => ({value: key, caption: label})
        ),
      },
    });
  };

  updateState() {
    this.state = this.facet?.state;
    this.showPlaceholder =
      this.searchStatus?.state?.isLoading &&
      !this.searchStatus?.state?.hasError &&
      !this.searchStatus?.state?.firstSearchExecuted;

    const renderFacetEvent = new CustomEvent('quantic__renderfacet', {
      detail: {
        id: this.facetId ?? this.field,
        shouldRenderFacet: !!this.hasParentsOrValues,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(renderFacetEvent);
  }

  validateDependsOnProperty() {
    if (this.dependsOn) {
      getBueno(this).then(() => {
        const {parentFacetId, expectedValue} = this.dependsOn;
        if (!Bueno.isString(parentFacetId)) {
          console.error(
            `The ${this.field} ${this.template.host.localName} requires dependsOn.parentFacetId to be a valid string.`
          );
          this.setInitializationError();
        }
        if (expectedValue && !Bueno.isString(expectedValue)) {
          console.error(
            `The ${this.field} ${this.template.host.localName} requires dependsOn.expectedValue to be a valid string.`
          );
          this.setInitializationError();
        }
      });
    }
  }

  initFacetConditionManager(engine) {
    this.categoryFacetConditionsManager =
      this.headless.buildFacetConditionsManager(engine, {
        facetId: this.facet.state.facetId,
        conditions: generateFacetDependencyConditions({
          [this.dependsOn.parentFacetId]: this.dependsOn.expectedValue,
        }),
      });
  }

  get values() {
    if (!this.state?.valuesAsTrees?.length) {
      return [];
    }

    if (this.state?.selectedValueAncestry?.length > 0) {
      return this.state?.activeValue?.children ?? [];
    }

    return this.state?.valuesAsTrees;
  }

  get nonActiveParents() {
    return this.state?.selectedValueAncestry?.slice(0, -1) ?? [];
  }

  get activeParent() {
    return this.state?.selectedValueAncestry?.slice(-1)[0];
  }

  get activeParentFormattedValue() {
    return this.activeParent
      ? this.remoteGetValueCaption(this.activeParent)
      : '';
  }

  get canShowMore() {
    return (
      this.facet && this.state?.canShowMoreValues && !this.isFacetSearchActive
    );
  }

  get canShowLess() {
    return (
      this.facet && this.state?.canShowLessValues && !this.isFacetSearchActive
    );
  }

  get hasParents() {
    return this.state?.selectedValueAncestry?.length;
  }

  get hasValues() {
    return this.state?.valuesAsTrees?.length;
  }

  get hasSearchResults() {
    return this.getSearchValues().length > 0;
  }

  get canShowMoreSearchResults() {
    return this.facet?.state.facetSearch.moreValuesAvailable;
  }

  get facetSearchResults() {
    return this.getSearchValues().map((result, index) => ({
      value: result.rawValue,
      index: index,
      numberOfResults: result.count,
      path: result.path,
      localizedPath: this.buildPath(
        result.path.map((path) => this.translateValue(path))
      ),
      highlightedResult: this.highlightResult(
        result.displayValue,
        this.input?.value
      ),
    }));
  }

  get query() {
    return this.input?.value;
  }

  get hasParentsOrValues() {
    return this.hasParents || this.hasValues;
  }

  get isFacetEnabled() {
    return this.state?.enabled;
  }

  get showMoreFacetValuesLabel() {
    return I18nUtils.format(this.labels.showMoreFacetValues, this.label);
  }

  get showLessFacetValuesLabel() {
    return I18nUtils.format(this.labels.showLessFacetValues, this.label);
  }

  get moreMatchesForLabel() {
    return I18nUtils.format(this.labels.moreMatchesFor, this.query);
  }

  get noMatchesForLabel() {
    return I18nUtils.format(this.labels.noMatchesFor, this.query);
  }

  get actionButtonIcon() {
    return this.isCollapsed ? 'utility:add' : 'utility:dash';
  }

  get actionButtonCssClasses() {
    return this.isCollapsed ? 'facet__expand' : 'facet__collapse';
  }

  get actionButtonLabel() {
    const label = this.isCollapsed
      ? this.labels.expandFacet
      : this.labels.collapseFacet;
    return I18nUtils.format(label, this.label);
  }

  get isSearchComplete() {
    return !this.facet.state.isLoading;
  }

  get isFacetSearchActive() {
    return this.withSearch && !!this.input?.value?.length;
  }

  /**
   * @returns {Array<CaptionProvider>}
   */
  get captionProviders() {
    // @ts-ignore
    return Array.from(this.querySelectorAll('*[slot="captions"]')).filter(
      // @ts-ignore
      (component) => component.captions
    );
  }

  getSearchValues() {
    return this.facet?.state?.facetSearch?.values ?? [];
  }

  translateValue(value) {
    return this.customCaptions[value] || value;
  }

  loadCustomCaptions() {
    // The list is reversed so the caption comes from the first provider matching the value.
    return this.captionProviders
      .reverse()
      .reduce(
        (captions, provider) => ({...captions, ...provider.captions}),
        {}
      );
  }

  /**
   * @param {CustomEvent<{value: string}>} evt
   */
  onSelectValue(evt) {
    const item = this.getItemFromValue(evt.detail.value);

    if (item && this.isFacetSearchActive) {
      this.facet.facetSearch.select({
        displayValue: item.value,
        rawValue: item.value,
        count: item.numberOfResults,
        path: item.path,
      });
    } else {
      // @ts-ignore
      this.facet.toggleSelect(item);
    }
    this.clearInput();
    this.keepFocusInFacet('facetValue');
  }

  getItemFromValue(value) {
    const facetValues = [...this.values, ...this.nonActiveParents];
    return (
      (this.isFacetSearchActive ? this.facetSearchResults : facetValues)
        // @ts-ignore
        .find((item) => this.remoteGetValueCaption(item) === value)
    );
  }

  preventDefault(evt) {
    evt.preventDefault();
  }

  showMore() {
    this.facet.showMoreValues();
    this.keepFocusInFacet('facetValue');
  }

  showLess() {
    this.facet.showLessValues();
    this.keepFocusInFacet('facetValue');
  }

  reset() {
    this.facet.deselectAll();
    this.keepFocusInFacet('facetHeader');
  }

  /**
   * @param {KeyboardEvent} evt
   */
  onKeyDownReset(evt) {
    if (evt.code === 'Enter' || evt.code === 'Space') {
      evt.preventDefault();
      this.facet.deselectAll();
      this.keepFocusInFacet('facetHeader');
    }
  }

  toggleFacetVisibility() {
    if (this.isCollapsed) {
      this.clearInput();
    }
    this._isCollapsed = !this.isCollapsed;
  }

  handleKeyUp() {
    if (this.isSearchComplete) {
      this.facet.facetSearch.updateText(this.input?.value);
      this.facet.facetSearch.search();
    }
  }

  clearInput() {
    if (this.input) {
      this.input.value = '';
    }
    this.facet.facetSearch.updateText('');
  }

  highlightResult(result, query) {
    if (!query || query.trim() === '') {
      return result;
    }
    const regex = new RegExp(`(${regexEncode(query)})`, 'i');
    return result.replace(regex, '<b>$1</b>');
  }

  /**
   * @param {string[]} path
   */
  buildPath(path) {
    if (!path.length) {
      return this.labels.allCategories;
    }
    if (path.length > 2) {
      path = path.slice(0, 1).concat('...', ...path.slice(-1));
    }
    return path.join('/');
  }

  /**
   * @param {"facetValue" | "facetHeader"} type
   */
  keepFocusInFacet(type) {
    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type,
    };
  }

  /**
   * Sets the focus on the target element.
   */
  setFocusOnTarget() {
    this.focusShouldBeInFacet = false;
    if (!this.focusTarget) {
      return;
    }
    if (this.focusTarget.type === 'facetHeader') {
      this.setFocusOnHeader();
    } else if (this.focusTarget.type === 'facetValue') {
      if (this.values.length) {
        this.setFocusOnFirstFacetValue();
      } else {
        this.setFocusOnLastNonActiveParent();
      }
    }
  }

  /**
   * Sets the focus on the first facet value.
   */
  setFocusOnFirstFacetValue() {
    const focusTarget = this.template.querySelector(
      '.facet__value > c-quantic-category-facet-value'
    );
    if (focusTarget) {
      // @ts-ignore
      focusTarget.setFocus();
    }
  }

  /**
   * Sets the focus on the last non-active parent.
   */
  setFocusOnLastNonActiveParent() {
    const nonActiveParents = this.template.querySelectorAll(
      '.facet__non-active-parent > c-quantic-category-facet-value'
    );
    const lastNonActiveParent = nonActiveParents[nonActiveParents.length - 1];
    if (lastNonActiveParent) {
      // @ts-ignore
      lastNonActiveParent.setFocus();
    }
  }

  /**
   * Sets the focus on the facet header.
   */
  setFocusOnHeader() {
    const focusTarget = this.template.querySelector('c-quantic-card-container');
    if (focusTarget) {
      // @ts-ignore
      focusTarget.setFocusOnHeader();
    }
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
