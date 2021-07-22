import {LightningElement, track, api} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

export default class QuanticNumericFacet extends LightningElement {
  /** @type {import("coveo").NumericFacetState} */
  // @ts-ignore TODO: Check CategoryFacetState typing and integration with LWC/Quantic
  @track state = {
    values: [],
  };
  /** @type {string} */
  @api field;
  /** @type {string} */
  @api label;
  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").NumericFacet} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {boolean} */
  isBodyVisible = true;
  /** @type {string} */
  facetIconName = "utility:dash";
  /** @type {boolean} */
  withSearch;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.facet = CoveoHeadless.buildNumericFacet(engine, {
      options: {
        field: this.field,
        generateAutomaticRanges: true,
      },
    });
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
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

  get hasValues() {
    return this.values.length !== 0;
  }

  get isAnyChecked(){
    return this.state.hasActiveValues;
  }

  /**
   * @param {CustomEvent<import("coveo").NumericFacetValue>} evt
   */
  onSelect(evt) {
    this.facet.toggleSelect(evt.detail);
  }

  clearSelections(){
    this.facet.deselectAll();
  }

  toggleFacetVisibility(){
    this.facetIconName = this.isBodyVisible ? "utility:add" : "utility:dash";
    this.isBodyVisible = !this.isBodyVisible;
  }
}
