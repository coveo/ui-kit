// @ts-check
import {LightningElement, track, api} from 'lwc';

export default class DateFacet extends LightningElement {
  /** @type {import("coveo").DateFacetState} */
  @track state = {
    values: [],
  };
  /** @type {string} */
  @api field;
  /** @type {string} */
  @api label;

  /** @type {import("coveo").DateFacet} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  @api
  set engine(eng) {
    if (!eng) {
      return;
    }

    this.e = eng;
    this.facet = CoveoHeadless.buildDateFacet(this.e, {
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
   * @param {CustomEvent<import("coveo").DateFacetValue>} evt
   */
  onSelect(evt) {
    this.facet.toggleSelect(evt.detail);
  }
}
