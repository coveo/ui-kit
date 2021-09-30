import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';
import LOCALE from '@salesforce/i18n/locale';

import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import clearFilter_plural from '@salesforce/label/c.quantic_ClearFilter_plural';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';

/** @typedef {import("coveo").DateFacetState} DateFacetState */
/** @typedef {import("coveo").DateFacet} DateFacet */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").DateFacetValue} DateFacetValue */

/**
 * The `QuanticDateFacet` component displays facet values as date ranges.
 * @example
 * <c-quantic-date-facet engine-id={engineId} facet-id="myfacet" field="date" label="Date" number-of-values="8" formatting-function={formattingFunction} is-collapsed></c-quantic-date-facet>
 */
export default class QuanticDateFacet extends LightningElement {
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
   * @defaultValue `(field)`
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
  @api label = 'no-label';
  /**
   * The number of values to request for this facet, when there are no manual ranges.
   * @api
   * @type {number}
   * @defaultValue `8`
   */
  @api numberOfValues = 8;
  /**
   * The function used to format the date facet value label.
   * The default result format is the following: `[start] - [end]`
   * @api
   * @type {Function}
   * @param {DateFacetValue} item
   * @returns {string}
   */
  @api formattingFunction = (item) => `${new Intl.DateTimeFormat(LOCALE).format(
    new Date(item.start)
  )} - ${new Intl.DateTimeFormat(LOCALE).format(
    new Date(item.end)
  )}`;
  /** 
   * Whether the facet should be collapsed.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(collapsed) {
    this._isCollapsed = collapsed;
  }
  /** @type {boolean} */
  _isCollapsed = false;

  /** @type {DateFacetState} */
  @track state;

  /** @type {DateFacet} */
  facet;
  /** @type {Function} */
  unsubscribe;

  labels = {
    clearFilter,
    clearFilter_plural,
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
    return this.isCollapsed ? 'utility:add' : 'utility:dash';
  }

  get actionButtonCssClasses() {
    return this.isCollapsed ? 'facet__expand' : 'facet__collapse';
  }

  get actionButtonLabel() {
    const label = this.isCollapsed ? this.labels.expandFacet : this.labels.collapseFacet;
    return I18nUtils.format(label, this.label);
  }

  get numberOfSelectedValues() {
    return this.state.values.filter(({state}) => state === 'selected').length;
  }

  get clearFilterLabel() {
    if (this.hasActiveValues) {
      const labelName = I18nUtils.getLabelNameWithCount('clearFilter', this.numberOfSelectedValues);
      return `${I18nUtils.format(this.labels[labelName], this.numberOfSelectedValues)}`;
    }
    return '';
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
    this._isCollapsed = !this.isCollapsed;
  }

  preventDefault(evt) {
    evt.preventDefault();
  }
}
