// @ts-check
import {LightningElement, track, api} from 'lwc';

export default class NumericFacet extends LightningElement {
  /** @type {import("coveo").NumericFacetState} */
  @track state = {
    values: [],
  };
  /** @type {string} */
  @api field;
  /** @type {string} */
  @api label;

  /** @type {import("coveo").NumericFacet} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  @api
  set engine(eng) {
    if (!eng) {
      return;
    }

    this.e = eng;
    this.facet = CoveoHeadless.buildNumericFacet(this.e, {
      options: {
        field: this.field,
        generateAutomaticRanges: true
      },
    });
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  get engine() {
    return this.e;
  }

  disconnectedCallback() {
    this.unsubscribe && this.unsubscribe();
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
   * @param {CustomEvent<import("coveo").NumericFacetValue>} evt
   */
  onSelect(evt) {
    this.facet.toggleSelect(evt.detail);
  }
}
