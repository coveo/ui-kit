
import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  registerToStore,
} from 'c/quanticHeadlessLoader';
import {I18nUtils, regexEncode, Store} from 'c/quanticUtils';

import showMore from '@salesforce/label/c.quantic_ShowMore';
import showLess from '@salesforce/label/c.quantic_ShowLess';
import showMoreFacetValues from '@salesforce/label/c.quantic_ShowMoreFacetValues';
import showLessFacetValues from '@salesforce/label/c.quantic_ShowLessFacetValues';
import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import clearFilter_plural from '@salesforce/label/c.quantic_ClearFilter_plural';
import search from '@salesforce/label/c.quantic_Search';
import moreMatchesFor from '@salesforce/label/c.quantic_MoreMatchesFor';
import noMatchesFor from '@salesforce/label/c.quantic_NoMatchesFor';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';

/** @typedef {import("coveo").FacetState} FacetState */
/** @typedef {import("coveo").Facet} Facet */
/** @typedef {import("coveo").FacetValue} FacetValue */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criterion (e.g., number of occurrences).
 * A `QuanticFacet` displays a facet of the results for the current query.
 * @category Search
 * @example
 * <c-quantic-facet engine-id={engineId} facet-id="myFacet" field="filetype" label="File Type" number-of-values="5" sort-criteria="occurrences" no-search display-values-as="link" is-collapsed></c-quantic-facet>
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
   *   - `automatic`
   * @api
   * @type  {'score' | 'alphanumeric' | 'occurrences' | 'automatic'}
   * @defaultValue `'automatic'`
   */
  @api sortCriteria = 'automatic';
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
  ]

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

  labels = {
    showMore,
    showLess,
    showMoreFacetValues,
    showLessFacetValues,
    clearFilter,
    clearFilter_plural,
    search,
    moreMatchesFor,
    noMatchesFor,
    collapseFacet,
    expandFacet,
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    this.input = this.template.querySelector('.facet__searchbox-input');
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );

    const options = {
      field: this.field,
      sortCriteria: this.sortCriteria,
      numberOfValues: Number(this.numberOfValues),
      facetSearch: this.noSearch ? undefined : {
        numberOfValues: Number(this.numberOfValues)
      },
      facetId: this.facetId ?? this.field,
      filterFacetCount: !this.noFilterFacetCount,
      injectionDepth: Number(this.injectionDepth),
    };
    this.facet = CoveoHeadless.buildFacet(engine, {options});
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
    registerToStore(this.engineId, Store.facetTypes.FACETS, {
      label: this.label,
      facetId: this.facet.state.facetId,
      element: this.template.host
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.state = this.facet?.state;
    this.showPlaceholder = this.searchStatus?.state?.isLoading && !this.searchStatus?.state?.hasError && !this.searchStatus?.state?.firstSearchExecuted;
  }

  get values() {
    return this.state?.values
      .filter((value) => value.numberOfResults || value.state === 'selected')
      .map((v) => ({
        ...v,
        checked: v.state === 'selected',
        highlightedResult: v.value,
      })) || [];
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
    const label = this.isCollapsed ? this.labels.expandFacet : this.labels.collapseFacet;
    return I18nUtils.format(label, this.label);
  }

  get isFacetSearchActive() {
    return !this.noSearch && !!this.input?.value?.length;
  }

  get isDisplayAsLink() {
    return this.displayValuesAs === 'link'
  }

  get numberOfSelectedValues() {
    return this.state.values.filter(({state}) => state === 'selected').length;
  }

  get clearFilterLabel() {
    if (this.hasActiveValues) {
      const labelName = I18nUtils.getLabelNameWithCount('clearFilter', this.numberOfSelectedValues);
      return `${I18nUtils.format(this.labels[labelName], this.numberOfSelectedValues)}`;
    }
    return '';
  }

  get displaySearch() {
    return !this.noSearch && this.state?.canShowMoreValues;
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
    return (this.isFacetSearchActive ? this.facetSearchResults : this.values).find((item) => item.value === value);
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
  }

  showMore() {
    this.facet.showMoreValues();
  }

  showLess() {
    this.facet.showLessValues();
  }

  clearSelections() {
    this.facet.deselectAll();
    this.clearInput();
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
    if(this.input) {
      this.input.value = '';
    }
    this.facet.facetSearch.updateText('');
  }

  highlightResult(result, query) {
    if (!query || query.trim() === '') {
      return result;
    }
    const regex = new RegExp(`(${regexEncode(query)})`, 'i');
    return result.replace(regex, '<b class="facet__search-result_highlight">$1</b>');
  }
}
