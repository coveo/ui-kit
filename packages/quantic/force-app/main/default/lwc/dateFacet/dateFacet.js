import {LightningElement, track, api} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/headlessLoader';

export default class DateFacet extends LightningElement {
  /** @type {import("coveo").DateFacetState} */
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

  /** @type {import("coveo").DateFacet} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
   * @param {import("coveo").Engine} engine
   */
  @api
  initialize(engine) {
    this.facet = CoveoHeadless.buildDateFacet(engine, {
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
    return this.state.values || [];
  }

  get hasValues() {
    return this.values.length !== 0;
  }

  /**
   * @param {CustomEvent<import("coveo").DateFacetValue>} evt
   */
  onSelect(evt) {
    this.facet.toggleSelect(evt.detail);
  }
}
