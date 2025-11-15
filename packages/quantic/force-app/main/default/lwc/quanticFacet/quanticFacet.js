import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import clearFilterFacet from '@salesforce/label/c.quantic_ClearFilterFacet';
import clearFilter_plural from '@salesforce/label/c.quantic_ClearFilter_plural';
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
  regexEncode,
  Store,
  generateFacetDependencyConditions,
} from 'c/quanticUtils';
import {LightningElement, track, api} from 'lwc';

/** @typedef {import("coveo").FacetState} FacetState */
/** @typedef {import("coveo").Facet} Facet */
/** @typedef {import("coveo").FacetValue} FacetValue */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").FacetConditionsManager} FacetConditionsManager */
/** @typedef {import('../quanticUtils/facetDependenciesUtils').DependsOn} DependsOn */
/**
 * @typedef FocusTarget
 * @type {object}
 * @property {'facetValue' | 'facetHeader'} type
 * @property {string} [value]
 * @property {number} [index]
 */
/**
 * @typedef CaptionProvider
 * @type {object}
 * @property {Record<string, string>} captions
 */

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criterion (for example, number of occurrences).
 * A `QuanticFacet` displays a facet of the results for the current query.
 * Custom captions can be provided by adding caption provider components to the `captions` named slot.
 * See [Create a custom caption provider component for Quantic facets](https://docs.coveo.com/en/quantic/latest/usage/create-custom-caption-provider-component/).
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-facet engine-id={engineId} facet-id="myFacet" field="filetype" label="File Type" number-of-values="5" sort-criteria="occurrences" no-search display-values-as="link" is-collapsed></c-quantic-facet>
 *
 * @example
 * <c-quantic-facet engine-id={engineId} field="filetype">
 *   <c-quantic-facet-caption slot="captions" value="text" caption="Plain text"></c-quantic-facet-caption>
 *   <c-quantic-facet-caption slot="captions" value="html" caption="Web page"></c-quantic-facet-caption>
 * </c-quantic-facet>
 */
export default class QuanticFacet extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * A unique identifier for the facet.
   * Defaults to the facet field.
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
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   * @api
   * @type {number}
   * @defaultValue `8`
   */
  @api numberOfValues = 8;
  /**
   * The sort criterion to apply to the returned facet values
   * Possible values are:
   *   - `score`
   *   - `alphanumeric`
   *   - `occurrences`
   * @api
   * @type  {'score' | 'alphanumeric' | 'occurrences'}
   * @defaultValue `'score'`
   */
  @api sortCriteria = 'score';
  /**
   * Whether this facet should not contain a search box.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api noSearch = false;
  /**
   * Whether to display the facet values as checkboxes (multiple selection) or links (single selection). Possible values are 'checkbox', 'link'.
   * @api
   * @type {'checkbox' | 'link'}
   * @defaultValue `'checkbox'`
   */
  @api displayValuesAs = 'checkbox';
  /**
   * Whether not to exclude the parents of folded results when estimating the result count for each facet value.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api noFilterFacetCount = false;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * @api
   * @type {number}
   * @defaultValue `1000`
   */
  @api injectionDepth = 1000;
  /**
   * Identifies the facet values that must appear at the top, in order.
   * This parameter can be used in conjunction with the `sortCriteria` parameter.
   * Facet values not part of the `customSort` list will be sorted according to the `sortCriteria`.
   * The maximum amount of custom sort values is 25.
   * The default value is `undefined`, and the facet values will be sorted using only the `sortCriteria`.
   * @api
   * @type {String[]}
   */
  @api customSort;
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
    'numberOfValues',
    'sortCriteria',
    'noSearch',
    'displayValuesAs',
    'noFilterFacetCount',
    'injectionDepth',
    'customSort',
    'dependsOn',
  ];

  /** @type {FacetState} */
  @track state;

  /** @type {Facet} */
  facet;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {boolean} */
  showPlaceholder = true;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;
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
  facetConditionsManager;

  labels = {
    showMore,
    showLess,
    showMoreFacetValues,
    showLessFacetValues,
    clearFilter,
    clearFilter_plural,
    clearFilterFacet,
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
    this.remoteGetValueCaption = this.getValueCaption.bind(this);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    this.input = this.template.querySelector('.facet__searchbox-input');
    if (this.focusShouldBeInFacet && !this.facet?.state?.isLoading) {
      this.setFocusOnTarget();
      this.focusTarget = null;
    }
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
        'The Quantic Facet component should not be used with custom captions and alphanumeric sorting simultaneously. The values might appear in the wrong order.'
      );
    }

    const options = {
      field: this.field,
      sortCriteria: this.sortCriteria,
      numberOfValues: Number(this.numberOfValues),
      facetSearch: this.noSearch
        ? undefined
        : {
            captions: this.customCaptions,
            numberOfValues: Number(this.numberOfValues),
          },
      facetId: this.facetId ?? this.field,
      filterFacetCount: !this.noFilterFacetCount,
      injectionDepth: Number(this.injectionDepth),
      customSort: Array.isArray(this.customSort)
        ? [...this.customSort]
        : undefined,
    };
    this.facet = this.headless.buildFacet(engine, {options});
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
    registerToStore(this.engineId, Store.facetTypes.FACETS, {
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
    if (this.dependsOn) {
      this.validateDependsOnProperty();
      this.initFacetConditionManager(engine);
    }
  };

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
    this.facetConditionsManager?.stopWatching();
  }

  updateState() {
    this.state = this.facet?.state;
    this.showPlaceholder =
      this.searchStatus?.state?.isLoading &&
      !this.searchStatus?.state?.hasError &&
      !this.searchStatus?.state?.firstSearchExecuted;

    const renderFacetEvent = new CustomEvent('quantic__renderfacet', {
      detail: {
        id: this.facetId ?? this.field,
        shouldRenderFacet: this.hasValues,
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
    this.facetConditionsManager = this.headless.buildFacetConditionsManager(
      engine,
      {
        facetId: this.facet.state.facetId,
        conditions: generateFacetDependencyConditions({
          [this.dependsOn.parentFacetId]: this.dependsOn.expectedValue,
        }),
      }
    );
  }

  get values() {
    return (
      this.state?.values
        .filter((value) => value.numberOfResults || value.state === 'selected')
        .map((v) => ({
          ...v,
          checked: v.state === 'selected',
          highlightedResult: this.getValueCaption(v),
        })) || []
    );
  }

  get query() {
    return this.input?.value;
  }

  get canShowMoreSearchResults() {
    return this.facet?.state.facetSearch.moreValuesAvailable;
  }

  get canShowMore() {
    if (!this.facet) {
      return false;
    }
    return this.state.canShowMoreValues;
  }

  get canShowLess() {
    if (!this.facet) {
      return false;
    }
    return this.state.canShowLessValues;
  }

  get hasValues() {
    return this.values.length !== 0;
  }

  get isFacetEnabled() {
    return this.state?.enabled;
  }

  get hasActiveValues() {
    return this.state.hasActiveValues;
  }

  get hasSearchResults() {
    return this.getSearchValues().length > 0;
  }

  get facetSearchResults() {
    return this.getSearchValues().map((result) => ({
      value: result.rawValue,
      state: 'idle',
      numberOfResults: result.count,
      checked: false,
      highlightedResult: this.highlightResult(
        result.displayValue,
        this.input?.value
      ),
    }));
  }

  get isSearchComplete() {
    return !this.facet.state.isLoading;
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

  get isFacetSearchActive() {
    return !this.noSearch && !!this.input?.value?.length;
  }

  get isDisplayAsLink() {
    return this.displayValuesAs === 'link';
  }

  get numberOfSelectedValues() {
    return this.state.values.filter(({state}) => state === 'selected').length;
  }

  get clearFilterLabel() {
    if (this.hasActiveValues) {
      const labelName = I18nUtils.getLabelNameWithCount(
        'clearFilter',
        this.numberOfSelectedValues
      );
      return `${I18nUtils.format(
        this.labels[labelName],
        this.numberOfSelectedValues
      )}`;
    }
    return '';
  }

  get clearFilterAriaLabelValue() {
    if (this.hasActiveValues) {
      return `${I18nUtils.format(this.labels.clearFilterFacet, this.field)}`;
    }
    return '';
  }

  get displaySearch() {
    return !this.noSearch && this.state?.canShowMoreValues;
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

  onSelectClickHandler(value) {
    if (this.isDisplayAsLink) {
      this.facet.toggleSingleSelect(value);
    } else {
      this.facet.toggleSelect(value);
    }
  }

  getSearchValues() {
    return this.facet?.state?.facetSearch?.values ?? [];
  }

  getItemFromValue(value) {
    return (
      this.isFacetSearchActive ? this.facetSearchResults : this.values
    ).find((item) => this.getValueCaption(item) === value);
  }

  getValueCaption(item) {
    return this.customCaptions[item.value] || item.value;
  }

  loadCustomCaptions() {
    // The list is reversed so the caption comes from the first provider matching the value.
    return this.captionProviders
      .reverse()
      .reduce((res, provider) => ({...res, ...provider.captions}), {});
  }

  /**
   * @param {CustomEvent<{value: string}>} evt
   */
  onSelectValue(evt) {
    const item = this.getItemFromValue(evt.detail.value);

    if (item && this.isFacetSearchActive) {
      const specificSearchResult = {
        displayValue: item.value,
        rawValue: item.value,
        count: item.numberOfResults,
      };
      if (this.isDisplayAsLink) {
        this.facet.facetSearch.singleSelect(specificSearchResult);
      } else {
        this.facet.facetSearch.select(specificSearchResult);
      }
    } else {
      this.onSelectClickHandler(item);
    }
    this.clearInput();
    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'facetValue',
      value: item.value,
    };
  }

  showMore() {
    this.facet.showMoreValues();
    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'facetValue',
      index: 0,
    };
  }

  showLess() {
    this.facet.showLessValues();
    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'facetValue',
      index: 0,
    };
  }

  clearSelections() {
    this.facet.deselectAll();
    this.clearInput();
    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'facetHeader',
    };
  }

  toggleFacetVisibility() {
    if (this.isCollapsed) {
      this.clearInput();
    }
    this._isCollapsed = !this.isCollapsed;
  }

  preventDefault(evt) {
    evt.preventDefault();
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
    return result.replace(
      regex,
      '<b class="facet__search-result_highlight">$1</b>'
    );
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
      if (this.focusTarget.value) {
        const facetValueIndex = this.values.findIndex(
          (item) => item.value === this.focusTarget.value
        );
        this.focusTarget.index = facetValueIndex >= 0 ? facetValueIndex : 0;
      }
      this.setFocusOnFacetValue();
    }
  }

  /**
   * Sets the focus on the target facet value.
   */
  setFocusOnFacetValue() {
    const facetValues = this.template.querySelectorAll('c-quantic-facet-value');
    const focusTarget = facetValues[this.focusTarget.index];
    if (focusTarget) {
      // @ts-ignore
      focusTarget.setFocus();
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
