import {api, LightningElement, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';
import {I18nService} from 'c/quanticUtils';

import clear from '@salesforce/label/c.quantic_Clear';
import showMore from '@salesforce/label/c.quantic_ShowMore';
import showLess from '@salesforce/label/c.quantic_ShowLess';
import showMoreFacetValues from '@salesforce/label/c.quantic_ShowMoreFacetValues';
import showLessFacetValues from '@salesforce/label/c.quantic_ShowLessFacetValues';

export default class QuanticCategoryFacet extends LightningElement {
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
  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").CategoryFacet}} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  labels = {
    clear,
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

  get showMoreFacetValuesLabel() {
    return I18nService.format(this.labels.showMoreFacetValues, this.label)
  }

  get showLessFacetValuesLabel() {
    return I18nService.format(this.labels.showLessFacetValues, this.label)
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
