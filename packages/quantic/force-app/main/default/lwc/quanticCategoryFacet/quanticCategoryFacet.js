import {api, LightningElement, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';
import {I18nUtils, regexEncode} from 'c/quanticUtils';

import clear from '@salesforce/label/c.quantic_Clear';
import showMore from '@salesforce/label/c.quantic_ShowMore';
import showLess from '@salesforce/label/c.quantic_ShowLess';
import showMoreFacetValues from '@salesforce/label/c.quantic_ShowMoreFacetValues';
import showLessFacetValues from '@salesforce/label/c.quantic_ShowLessFacetValues';
import allCategories from '@salesforce/label/c.quantic_AllCategories';
import search from '@salesforce/label/c.quantic_Search';
import moreMatchesFor from '@salesforce/label/c.quantic_MoreMatchesFor';
import noMatchesFor from '@salesforce/label/c.quantic_NoMatchesFor';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").CategoryFacet} CategoryFacet */
/** @typedef {import("coveo").CategoryFacetState} CategoryFacetState */
/** @typedef {import("coveo").CategoryFacetValue} CategoryFacetValue */

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * A `QuanticCategoryFacet` displays a facet of values in a browsable, hierarchical fashion.
 * @category LWC
 * @example
 * <c-quantic-category-facet field="geographicalhierarchy" label="Country" engine-id={engineId}></c-quantic-category-facet>
 */
export default class QuanticCategoryFacet extends LightningElement {
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
   * Whether this facet should not contain a search box.
   * @api
   * @type {boolean}
   * @default false
   */
  @api noSearch = false;

  /** @type {CategoryFacetState} */
  @track state;

  /** @type {CategoryFacet} */
  facet;
  /** @type {Function} */
  unsubscribe;
  /** @type {string} */
  collapseIconName = 'utility:dash';
  /** @type {boolean} */
  isExpanded = true;
  /** @type {HTMLInputElement} */
  input;
 
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

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.facet = CoveoHeadless.buildCategoryFacet(engine, {
      options: {
        field: this.field,
        delimitingCharacter: ';',
        facetId: this.facetId ?? this.field,
      },
    });
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  updateState() {
    this.state = this.facet.state;
  }

  get values() {
    return this.state.values;
  }

  get nonActiveParents() {
    return this.state.parents?.slice(0, -1);
  }

  get activeParent() {
    return this.state.parents?.slice(-1)[0];
  }

  get canShowMore() {
    return this.facet && this.state.canShowMoreValues  && !this.isFacetSearchActive;
  }

  get canShowLess() {
    return this.facet && this.state.canShowLessValues;
  }

  get hasParents() {
    return this.state.parents.length !== 0;
  }

  get hasValues() {
    return this.state.values.length !== 0;
  }

  get hasSearchResults() {
    return this.facet?.state.facetSearch.values.length !== 0;
  }

  get canShowMoreSearchResults() {
    return this.facet?.state.facetSearch.moreValuesAvailable;
  }

  get facetSearchResults() {
    const results = this.facet.state.facetSearch.values;
    return results.map((result, index) => ({
      value: result.rawValue,
      index: index,
      numberOfResults: result.count,
      path: result.path,
      localizedPath: this.buildPath(result.path) ,
      highlightedResult: this.highlightResult(
        result.displayValue,
        this.input.value
      ),
    }));
  }

  get query() {
    return this.input?.value;
  }

  get hasParentsOrValues() {
    return this.hasParents || this.hasValues;
  }

  get showMoreFacetValuesLabel() {
    return I18nUtils.format(this.labels.showMoreFacetValues, this.label)
  }

  get showLessFacetValuesLabel() {
    return I18nUtils.format(this.labels.showLessFacetValues, this.label)
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

  get isSearchComplete() {
    return !this.facet.state.isLoading;
  }

  get isFacetSearchActive() {
    return this.input?.value !== '';
  }

  /**
   * @param {CustomEvent<CategoryFacetValue>} evt
   */
  onSelect(evt) {
    const specificSearchResult = {
      displayValue: evt.detail.value,
      rawValue: evt.detail.value,
      count: evt.detail.numberOfResults,
      path: evt.detail.path
    };
    if (this.isFacetSearchActive) {
      this.facet.facetSearch.select(specificSearchResult);
    } else {
      this.facet.toggleSelect(evt.detail);
    }
    this.clearInput();
  }

  showMore() {
    this.facet.showMoreValues();
  }

  showLess() {
    this.facet.showLessValues();
  }

  reset() {
    this.facet.deselectAll();
  }

  toggleFacetVisibility() {
    if (this.isExpanded) {
      this.clearInput();
    }
    this.isExpanded = !this.isExpanded;
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
    return result.replace(regex, '<b>$1</b>');
  }

  /**
   * @param {string[]} path
   */
  buildPath(path) {
    if(!path.length) {
      return this.labels.allCategories;
    } 
    if(path.length > 2) {
      path = path.slice(0, 1).concat("...", ...path.slice(-1));
    }
    return path.join('/');
  }
}
