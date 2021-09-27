import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';
import LOCALE from '@salesforce/i18n/locale';

import clear from '@salesforce/label/c.quantic_Clear';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';

export default class QuanticDateFacet extends LightningElement {
  /** @type {import("coveo").DateFacetState} */
  // @ts-ignore TODO: Check CategoryFacetState typing and integration with LWC/Quantic
  @track state = {
    values: [],
  };

  /** @type {string} */
  @api facetId;
  /** @type {string} */
  @api field;
  /** @type {string} */
  @api label = 'no-label';
  /** @type {string} */
  @api engineId;
  /** @type {number} */
  @api numberOfValues = 8;
  /** @type {(any) => string} */
  @api formattingFunction = (item) => `${new Intl.DateTimeFormat(LOCALE).format(
    new Date(item.start)
  )} - ${new Intl.DateTimeFormat(LOCALE).format(
    new Date(item.end)
  )}`;

  /** @type {import("coveo").DateFacet} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {boolean} */
  isExpanded = true;

  labels = {
    clear,
    collapseFacet,
    expandFacet,
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  initialize = (engine) => {
    this.facet = CoveoHeadless.buildDateFacet(engine, {
      options: {
        field: this.field,
        numberOfValues: Number(this.numberOfValues),
        generateAutomaticRanges: true,
        facetId: this.facetId ?? this.field,
      },
    });
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.facet.state;
  }

  get values() {
    return (
      this.state.values
        .filter((value) => value.numberOfResults || value.state === 'selected')
        .map((value) => {
          return {
            ...value,
            checked: value.state === 'selected',
          };
        }) || []
    );
  }

  get hasValues() {
    return this.values.length !== 0;
  }

  get hasActiveValues() {
    return this.state.hasActiveValues;
  }

  get actionButtonIcon() {
    return this.isExpanded ? 'utility:dash' : 'utility:add';
  }
  
  get actionButtonLabel() {
    const label = this.isExpanded ? this.labels.collapseFacet : this.labels.expandFacet;
    return I18nUtils.format(label, this.label);
  }

  /**
   * @param {CustomEvent<import("coveo").DateFacetValue>} evt
   */
  onSelect(evt) {
    this.facet.toggleSelect(evt.detail);
  }

  clearSelections() {
    this.facet.deselectAll();
  }

  toggleFacetVisibility() {
    this.isExpanded = !this.isExpanded;
  }

  preventDefault(evt) {
    evt.preventDefault();
  }
}
