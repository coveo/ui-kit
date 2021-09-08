import {api, LightningElement, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';

import clear from '@salesforce/label/c.quantic_Clear';
import showMore from '@salesforce/label/c.quantic_ShowMore';
import showLess from '@salesforce/label/c.quantic_ShowLess';
import showMoreFacetValues from '@salesforce/label/c.quantic_ShowMoreFacetValues';
import showLessFacetValues from '@salesforce/label/c.quantic_ShowLessFacetValues';
import allCategories from '@salesforce/label/c.quantic_AllCategories';
import search from '@salesforce/label/c.quantic_Search';

export default class QuanticCategoryFacet extends LightningElement {
  /** @type {import("coveo").CategoryFacetState} */
  // @ts-ignore TODO: Check CategoryFacetState typing and integration with LWC/Quantic
  @track state = {
    values: [],
    parents: [],
  };
  /** @type {string} */
  @api field;
  /** @type {string} */
  @api label;
  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").CategoryFacet}} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {boolean} */
  isCollapsed = false;
  /** @type {string} */
  collapseIconName = 'utility:dash';

  /** @type {HTMLInputElement} */
  input;
  /** @type {boolean} */
  isFacetSearchActive = false;
 
  labels = {
    clear,
    showMore,
    showLess,
    showMoreFacetValues,
    showLessFacetValues,
    allCategories,
    search
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
    this.input = this.template.querySelector('.facet__searchbox-input');
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.facet = CoveoHeadless.buildCategoryFacet(engine, {
      options: {
        field: this.field,
        delimitingCharacter: ';',
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
    return this.state.parents.slice(0, -1);
  }
  get activeParent() {
    return this.state.parents.slice(-1)[0];
  }

  get canShowMore() {
    if (!this.facet) {
      return false;
    }
    return this.state.canShowMoreValues  && !this.isFacetSearchActive;
  }

  get canShowLess() {
    if (!this.facet) {
      return false;
    }
    return this.state.canShowLessValues;
  }

  get hasParents() {
    return this.state.parents.length !== 0;
  }

  get hasValues() {
    return this.state.values.length !== 0;
  }

  get hasSearchResults() {
    return this.facet.state.facetSearch.values.length !== 0;
  }

  get facetSearchResults() {
    const results = this.facet.state.facetSearch.values;
    return results.map((result) => ({
      value: result.rawValue,
      numberOfResults: result.count,
      localizedPath: this.buildPath(result.path) ,
      highlightedResult: this.highlightResult(
        result.displayValue,
        this.input.value
      ),
    }));
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

  get isSearchComplete() {
    return !this.facet.state.isLoading;
  }

  /**
   * @param {CustomEvent<import("coveo").CategoryFacetValue>} evt
   */
  onSelect(evt) {
    this.facet.toggleSelect(evt.detail);
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
    this.collapseIconName = this.isCollapsed ? 'utility:dash' : 'utility:add';
    this.isCollapsed = !this.isCollapsed;
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
    return result.replace(regex, '<b>$1</b>');
  }

  regexEncode(value) {
    return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  }
  /**
   * @param {string[]} path
   */
  buildPath(path) {
    if(!path.length) 
      return this.labels.allCategories;
    if(path.length > 2)  
    {
      path = path.slice(0, 1).concat("...", ...path.slice(-1));
    }
    return path.join('/');
  }
}
