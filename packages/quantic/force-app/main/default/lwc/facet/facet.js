import {LightningElement, track, api} from 'lwc';
import {getHeadlessEngine, registerComponentForInit, setComponentInitialized} from 'c/headlessLoader';

export default class Facet extends LightningElement {
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

  /** @type {import("coveo").Facet}} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  constructor() {
    super();
    registerComponentForInit(this);
  }

  connectedCallback() {
    try {
      getHeadlessEngine(this).then((engine) => {
        this.initialize(engine);
        setComponentInitialized(this);
      })
    } catch (error) {
      console.error('Fatal error: unable to initialize component', error);
    }
  }

  /**
   * @param {import("coveo").Engine} engine
   */
  @api
  initialize(engine) {
    this.facet = CoveoHeadless.buildFacet(engine, {
      options: {
        field: this.field,
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

  /**
   * @param {CustomEvent<import("coveo").FacetValue>} evt
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
}
