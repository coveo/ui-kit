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

/** @typedef {import("coveo").NumericFacetState} NumericFacetState */
/** @typedef {import("coveo").NumericFacet} NumericFacet */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").NumericFacetValue} NumericFacetValue */
/** @typedef {import("coveo").RangeFacetSortCriterion} RangeFacetSortCriterion */
/** @typedef {import("coveo").RangeFacetRangeAlgorithm} RangeFacetRangeAlgorithm */

/**
 * The `QuanticNumericFacet` component displays facet values as numeric ranges.
 * @category LWC
 * @example
 * <c-quantic-numeric-facet field="ytlikecount" label="Youtube Likes" engine-id={engineId}></c-quantic-numeric-facet>
 */
export default class QuanticNumericFacet extends LightningElement {
  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;
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
   * The number of values to request for this facet, when there are no manual ranges.
   * @api
   * @type {number}
   * @defaultValue 8
   */
  @api numberOfValues = 8;
  /**
   * The number of values to request for this facet, when there are no manual ranges.
   * @api
   * @type {RangeFacetSortCriterion}
   * @defaultValue 'ascending'
   */
  @api sortCriteria = 'ascending';
  /**
   * The algorithm that’s used for generating the ranges of this facet when they aren’t manually defined.
   * The default value of "even" generates equally sized facet ranges across all of the results.
   * The value "equiprobable" generates facet ranges which vary in size but have a more balanced number of results within each range.
   * @api
   * @type {RangeFacetRangeAlgorithm}
   * @defaultValue 'equiprobable'
   */
  @api rangeAlgorithm = 'equiprobable';
  /**
   * The function used to format the date facet value label.
   * @api
   * @type {Function}
   * @param {NumericFacetValue} item
   * @returns {string}
   * @defaultValue Formatted result: [start] - [end]
   */
  @api formattingFunction = (item) => `${new Intl.NumberFormat(LOCALE).format(
    item.start
  )} - ${new Intl.NumberFormat(LOCALE).format(
    item.end
  )}`;

  /** @type {NumericFacetState} */
  @track state;

  /** @type {NumericFacet} */
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
    this.facet = CoveoHeadless.buildNumericFacet(engine, {
      options: {
        field: this.field,
        generateAutomaticRanges: true,
        sortCriteria: this.sortCriteria,
        rangeAlgorithm: this.rangeAlgorithm,
        numberOfValues: Number(this.numberOfValues),
        facetId: this.facetId ?? this.field,
      }
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
      this.state?.values
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
    return this.state?.hasActiveValues;
  }

  get actionButtonIcon() {
    return this.isExpanded ? 'utility:dash' : 'utility:add';
  }
  
  get actionButtonLabel() {
    const label = this.isExpanded ? this.labels.collapseFacet : this.labels.expandFacet;
    return I18nUtils.format(label, this.label);
  }

  /**
   * @param {CustomEvent<NumericFacetValue>} evt
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
