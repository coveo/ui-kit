import {
  LightningElement,
  track,
  api
} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless
} from 'c/quanticHeadlessLoader';

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
  /** @type {boolean} */
  withSearch = true;
  /** @type {string} */
  facetIcon = "utility:dash";
  /** @type {HTMLInputElement} */
  input;
  /** @type {number} */
  numberOfValues = 8;
  /** @type  {import("coveo").FacetSortCriterion}*/
  sortCriterion = 'automatic';
  /** @type {string} */
  facetId;
  /** @type {boolean} */
  isFacetSearchActive = false;

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
    // this.withSearch = this.state.values.length > 15;
    if (!this.input){
      this.input = this.template.querySelector('.facet__search-input');
    }
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
      checked: v.state === 'selected'
    })) || [];
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

  get facetSearchResults(){
    const results = this.facet.state.facetSearch.values
    return results.map(result => ({
      value: result.displayValue,
      state: 'idle',
      numberOfResults: result.count,
      checked: false,
    }));
  }
  /**
   * @param {CustomEvent<import("coveo").FacetValue>} evt
   */
  onSelect(evt) {
    console.log(evt.detail);
    this.facet.toggleSelect(evt.detail);
  }

  showMore() {
    this.facet.showMoreValues();
  }

  showLess() {
    this.facet.showLessValues();
  }

  clearSelections(){
    this.facet.deselectAll();
    console.log(this.input.value);
  }

  toggleFacetVisibility(){
    this.facetIcon = this.isBodyVisible ? "utility:add" : "utility:dash";
    this.isBodyVisible = !this.isBodyVisible;
  }

  handleKeyUp(){
    this.isFacetSearchActive = this.input.value !== '';
    this.facet.facetSearch.updateText(this.input.value);
    this.facet.facetSearch.search();
    console.log(this.facetSearchResults);
  }



}