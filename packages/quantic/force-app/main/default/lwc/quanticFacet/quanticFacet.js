import {
  LightningElement,
  track,
  api
} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless
} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';

import showMore from '@salesforce/label/c.quantic_ShowMore';
import showLess from '@salesforce/label/c.quantic_ShowLess';
import showMoreFacetValues from '@salesforce/label/c.quantic_ShowMoreFacetValues';
import showLessFacetValues from '@salesforce/label/c.quantic_ShowLessFacetValues';

export default class QuanticFacet extends LightningElement {
  /** @type {import("coveo").FacetState} */
  // @ts-ignore TODO: Check CategoryFacetState typing and integration with LWC/Quantic
  @track state = {
    sortCriterion: 'score',
    values: [],
  };
  /** @type {string} */
  @api field;
  /** @type {string} */
  @api label;
  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").Facet}} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {boolean} */
  isBodyVisible = true;
  /** @type {string} */
  facetIcon = "utility:dash";
  /** @type {HTMLInputElement} */
  input;
  /** @type {number} */
  numberOfValues = 8;
  /** @type  {import("coveo").FacetSortCriterion}*/
  sortCriterion = 'automatic';
  /** @type {boolean} */
  isFacetSearchActive = false;

  labels = {
    showMore,
    showLess,
    showMoreFacetValues,
    showLessFacetValues,
  }
  
  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    const options = {
      field: this.field,
      sortCriteria: this.sortCriterion,
      facetSearch: {numberOfValues: this.numberOfValues},
    }
    this.facet = CoveoHeadless.buildFacet(engine, {options});
    this.facetId = this.facet.state.facetId;
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
    this.input = this.template.querySelector('.facet__search-input');
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateState() {
    this.state = this.facet.state;
  }

  get values() {
    return this.state.values.map(v => ({
      ...v,
      checked: v.state === 'selected',
      highlightedResult: v.value,
    })) || [];
  }

  get query(){
    return this.input.value;
  }

  get canShowMoreSearchResults() {
    if(!this.facet){
      return false;
    }
    return this.facet.state.facetSearch.moreValuesAvailable;
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

  get isAnyChecked(){
    return this.state.hasActiveValues;
  }

  get hasSearchResults(){
    return this.facet.state.facetSearch.values.length !== 0;
  }

  get facetSearchResults(){
    const results = this.facet.state.facetSearch.values;
    return results.map(result => ({
      value: result.rawValue,
      state: 'idle',
      numberOfResults: result.count,
      checked: false,
      highlightedResult: this.highlightResult(result.displayValue, this.input.value),
    }));
  }

  get isSearchComplete(){
    return !this.facet.state.isLoading;
  }
  
  get showMoreFacetValuesLabel() {
    return I18nUtils.format(this.labels.showMoreFacetValues, this.label)
  }

  get showLessFacetValuesLabel() {
    return I18nUtils.format(this.labels.showLessFacetValues, this.label)
  }

  /**
   * @param {CustomEvent<import("coveo").FacetValue>} evt
   */
  onSelect(evt) {
    const specificSearchResult = {
      displayValue: evt.detail.value,
      rawValue: evt.detail.value,
      count: evt.detail.numberOfResults,
    
    }
    if(this.isFacetSearchActive){
      this.facet.facetSearch.select(specificSearchResult);
    }else{
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

  clearSelections(){
    this.facet.deselectAll();
    this.clearInput();
  }

  toggleFacetVisibility(){
    this.facetIcon = this.isBodyVisible ? "utility:add" : "utility:dash";
    this.isBodyVisible = !this.isBodyVisible;
  }

  handleKeyUp(){
    console.log(this.canShowMore);
    if(this.isSearchComplete){
      this.isFacetSearchActive = this.input.value !== '';
      this.facet.facetSearch.updateText(this.input.value);
      this.facet.facetSearch.search();
    }
  }

  clearInput(){
    this.input.value = '';
    this.updateState();
  }

  highlightResult(result, query){
    if(!query || query.trim() === ''){
      return result;
    }
    const regex = new RegExp(`(${this.regexEncode(query)})`, 'i');
    return result.replace(regex, '<b>$1</b>');
  }

  regexEncode(value){
    return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  }
}