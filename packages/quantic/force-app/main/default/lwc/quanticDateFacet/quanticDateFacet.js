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

/** @typedef {import("coveo").DateFacetState} DateFacetState */
/** @typedef {import("coveo").DateFacet} DateFacet */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").DateFacetValue} DateFacetValue */

/**
 * The `QuanticDateFacet` component displays facet values as date ranges.
 * @category LWC
 * @example
 * <c-quantic-date-facet field="date" label="Date" engine-id={engineId}></c-quantic-date-facet>
 */
export default class QuanticDateFacet extends LightningElement {
  /** 
   * Specifies a unique identifier for the facet.
   * @api
   * @type {string}
   * @defaultValue [field]
   */
  @api facetId;
  /**
   * Specifies the index field whose values the facet should use.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * The non-localized label for the facet.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The number of values to request for this facet, when there are no manual ranges.
   * @api
   * @type {number}
   * @defaultValue 8
   */
  @api numberOfValues = 8;
  /**
   * The function used to format the date facet value label.
   * @api
   * @type {Function}
   * @param {DateFacetValue}
   * @returns {string}
   * @defaultValue Formatted result: [start] - [end]
   */
  @api formattingFunction = (item) => `${new Intl.DateTimeFormat(LOCALE).format(
    new Date(item.start)
  )} - ${new Intl.DateTimeFormat(LOCALE).format(
    new Date(item.end)
  )}`;

  /** @type {DateFacetState} */
  @track state = {
    values: [],
  };

  /** @type {DateFacet} */
  facet;
  /** @type {Function} */
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
   * @param {SearchEngine} engine
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
   * @param {CustomEvent<DateFacetValue>} evt
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
