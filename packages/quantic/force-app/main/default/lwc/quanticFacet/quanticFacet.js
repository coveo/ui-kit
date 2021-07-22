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

  /** @type {import("coveo").SearchBox} */
  searchbox;
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
  /** @type {HTMLButtonElement} */
  clearButton;

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.facet = CoveoHeadless.buildFacet(engine, {
      options: {
        field: this.field,
      },
    });
    this.searchbox = CoveoHeadless.buildSearchBox(engine);
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
    // this.withSearch = this.state.values.length > 15;
    if (!this.input){
      this.input = this.template.querySelector('input');
    }
    if (!this.clearButton){
      this.clearButton = this.template.querySelector('.facet-search__clear-button');
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

  /**
   * @param {CustomEvent<import("coveo").FacetValue>} evt
   */
  onSelect(evt) {
    this.facet.toggleSelect(evt.detail);
  }

  clearSelections(){
    this.facet.deselectAll();
  }

  showMore() {
    this.facet.showMoreValues();
  }

  showLess() {
    this.facet.showLessValues();
  }

  toggleFacetVisibility(){
    this.facetIcon = this.isBodyVisible ? "utility:add" : "utility:dash";
    this.isBodyVisible = !this.isBodyVisible;
  }

  onSearchFocus() {
    this.clearButton.classList.remove('slds-hidden');
    this.clearButton.classList.add('slds-visible');
  }

  onSearchBlur() {
    this.clearButton.classList.remove('slds-visible');
    this.clearButton.classList.add('slds-hidden');
  }

  clearInput(){
    this.input.value = '';
    this.searchbox.updateText(this.input.value);
  }

}