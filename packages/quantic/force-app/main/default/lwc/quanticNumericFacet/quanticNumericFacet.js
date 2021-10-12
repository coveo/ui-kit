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

/** @typedef {import("coveo").NumericFacetState} NumericFacetState */
/** @typedef {import("coveo").NumericFacet} NumericFacet */
/** @typedef {import("coveo").NumericFacetValue} NumericFacetValue */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticNumericFacet` component displays facet values as numeric ranges.
 * @example
 * <c-quantic-numeric-facet engine-id={engineId} facet-id="myfacet" field="ytlikecount" label="Youtube Likes" numberOfValues="5" sort-criteria="descending" range-algorithm="even" formatting-function={myFormattingFunction} is-collapsed></c-quantic-numeric-facet>
 */
export default class QuanticNumericFacet extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /** 
   * A unique identifier for the facet.
   * @api
   * @type {string}
   * @defaultValue Defaults to the `field` value.
   */
  @api facetId;
  /**
   * Specifies the index field whose values the facet should use.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * The non-localized label for the facet. This label is displayed in the facet header.
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
   * The sort criterion to apply to the returned facet values. Possible values are:
   *   - `ascending`
   *   - `descending`
   * @api
   * @type {'ascending' | 'descending'}
   * @defaultValue `'ascending'`
   */
  @api sortCriteria = 'ascending';
  /**
   * The algorithm used for generating the ranges of this facet when they aren’t manually defined.
   * The default value of `'even'` generates equally sized facet ranges across all of the results.
   * The value `'equiprobable'` generates facet ranges which vary in size but have a more balanced number of results within each range.
   * @api
   * @type {'even' | 'equiprobable'}
   * @defaultValue `'equiprobable'`
   */
  @api rangeAlgorithm = 'equiprobable';
  /**
   * The function used to format the date facet value label.
   * The default result format is the following: `[start] - [end]`
   * @api
   * @type {Function}
   * @param {NumericFacetValue} item
   * @returns {string}
   */
  @api formattingFunction = (item) => `${new Intl.NumberFormat(LOCALE).format(
    item.start
  )} - ${new Intl.NumberFormat(LOCALE).format(
    item.end
  )}`;
  /**
   * Whether the facet is collapsed.
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

  /** @type {NumericFacetState} */
  @track state;

  /** @type {NumericFacet} */
  facet;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {boolean} */
  showPlaceholder = true;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;

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
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );

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
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.state = this.facet?.state;
    this.showPlaceholder = !this.searchStatus?.state?.firstSearchExecuted;
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
   * @param {CustomEvent<NumericFacetValue>} evt
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
