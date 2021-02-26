import {api, LightningElement, track} from 'lwc';
import {getHeadlessEngine, registerComponentForInit, setComponentInitialized} from 'c/headlessLoader';

export default class CategoryFacet extends LightningElement {
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

  /** @type {import("coveo").CategoryFacet}} */
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

  get parents() {
    return this.state.parents;
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

  get hasParents() {
    return this.state.parents.length !== 0;
  }

  get hasValues() {
    return this.state.values.length !== 0;
  }

  get hasParentsOrValues() {
    return this.hasParents || this.hasValues;
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
}
