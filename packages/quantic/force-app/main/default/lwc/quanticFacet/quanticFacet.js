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

  labels = {
    showMore,
    showLess,
    showMoreFacetValues,
    showLessFacetValues,
  }

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
    this.facet.toggleSelect(evt.detail);
  }

  showMore() {
    this.facet.showMoreValues();
  }

  showLess() {
    this.facet.showLessValues();
  }
}