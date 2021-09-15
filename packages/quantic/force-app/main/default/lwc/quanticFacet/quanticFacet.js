
import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';

import showMore from '@salesforce/label/c.quantic_ShowMore';
import showLess from '@salesforce/label/c.quantic_ShowLess';
import showMoreFacetValues from '@salesforce/label/c.quantic_ShowMoreFacetValues';
import showLessFacetValues from '@salesforce/label/c.quantic_ShowLessFacetValues';
import clear from '@salesforce/label/c.quantic_Clear';
import search from '@salesforce/label/c.quantic_Search';
import moreMatchesFor from '@salesforce/label/c.quantic_MoreMatchesFor';
import noMatchesFor from '@salesforce/label/c.quantic_NoMatchesFor';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';

/** @typedef {import("coveo").FacetState} FacetState */
/** @typedef {import("coveo").FacetSortCriterion} FacetSortCriterion */
/** @typedef {import("coveo").Facet} Facet */
/** @typedef {import("coveo").FacetValue} FacetValue */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).\
 * A `QuanticFacet` displays a facet of the results for the current query.
 * @category LWC
 * @example
 * <c-quantic-facet field="filetype" label="File Type" engine-id={engineId}></c-quantic-facet>
 */
export default class QuanticFacet extends LightningElement {
  /** 
   * An unique ID used to identify the facet instance.
   * Defaults to given facet label.
   * @api
   * @type {string}
   * @default (label)
   */
  @api facetId;
  /**
   * The field whose values you want to display in the facet.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * The non-localized label for the facet.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   * @api
   * @type {number}
   * @default 8
   */
  @api numberOfValues = 8;
  /**
   * The sort criterion to apply to the returned facet values
   * Possible values are:
   *   - score
   *   - numeric
   *   - occurences
   *   - automatic
   * @api
   * @type  {FacetSortCriterion}
   * @default automatic
   */
  @api sortCriteria = 'automatic';
  /**
   * Whether this facet should not contain a search box.
   * @api
   * @type {boolean}
   * @default false
   */
  @api noSearch = false;

  /** @type {FacetState} */
  @track state;

  /** @type {Facet} */
  facet;
  /** @type {Function} */
  unsubscribe;
  /** @type {boolean} */
  isExpanded = true;
  /** @type {HTMLInputElement} */
  input;
  /** @type {boolean} */
  isFacetSearchActive = false;

  labels = {
    showMore,
    showLess,
    showMoreFacetValues,
    showLessFacetValues,
    clear,
    search,
    moreMatchesFor,
    noMatchesFor,
    collapseFacet,
    expandFacet,
  };

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    const options = {
      field: this.field,
      sortCriteria: this.sortCriteria,
      numberOfValues: Number(this.numberOfValues),
      facetSearch: {numberOfValues: Number(this.numberOfValues)},
      facetId: this.facetId ?? this.field,
    };
    this.facet = CoveoHeadless.buildFacet(engine, {options});
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    this.input = this.template.querySelector('.facet__searchbox-input');
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.facet.state;
  }

  get values() {
    return (
      this.state?.values
        .filter((value) => value.numberOfResults || value.state === 'selected')
        .map((v) => ({
          ...v,
          checked: v.state === 'selected',
          highlightedResult: v.value,
        })) || []
    );
  }

  get query() {
    return this.input.value;
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
    return this.facet.state.facetSearch.values.length !== 0;
  }

  get facetSearchResults() {
    const results = this.facet.state.facetSearch.values;
    return results.map((result) => ({
      value: result.rawValue,
      state: 'idle',
      numberOfResults: result.count,
      checked: false,
      highlightedResult: this.highlightResult(
        result.displayValue,
        this.input.value
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
    return this.isExpanded ? 'utility:dash' : 'utility:add';
  }

  get actionButtonLabel() {
    const label = this.isExpanded ? this.labels.collapseFacet : this.labels.expandFacet;
    return I18nUtils.format(label, this.label);
  }

  /**
   * @param {CustomEvent<FacetValue>} evt
   */
  onSelect(evt) {
    const specificSearchResult = {
      displayValue: evt.detail.value,
      rawValue: evt.detail.value,
      count: evt.detail.numberOfResults,
    };
    if (this.isFacetSearchActive) {
      this.facet.facetSearch.select(specificSearchResult);
    } else {
      this.facet.toggleSelect(evt.detail);
    }
    this.clearInput();
    this.isFacetSearchActive = false;
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
    this.isExpanded = !this.isExpanded;
  }

  preventDefault(evt) {
    evt.preventDefault();
  }

  handleKeyUp() {
    if (this.isSearchComplete) {
      this.isFacetSearchActive = this.input.value !== '';
      this.facet.facetSearch.updateText(this.input.value);
      this.facet.facetSearch.search();
    }
  }

  clearInput() {
    this.input.value = '';
    this.updateState();
  }

  highlightResult(result, query) {
    if (!query || query.trim() === '') {
      return result;
    }
    const regex = new RegExp(`(${this.regexEncode(query)})`, 'i');
    return result.replace(regex, '<b class="facet__search-result_highlight">$1</b>');
  }

  regexEncode(value) {
    return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  }
}
