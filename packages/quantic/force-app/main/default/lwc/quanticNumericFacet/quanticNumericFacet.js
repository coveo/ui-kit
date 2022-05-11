import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBindings,
  registerToStore
} from 'c/quanticHeadlessLoader';
import {I18nUtils, Store} from 'c/quanticUtils';
import LOCALE from '@salesforce/i18n/locale';

import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import clearFilter_plural from '@salesforce/label/c.quantic_ClearFilter_plural';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';
import min from "@salesforce/label/c.quantic_Min";
import max from "@salesforce/label/c.quantic_Max";
import numberInputMinimum from "@salesforce/label/c.quantic_NumberInputMinimum";
import numberInputMaximum from "@salesforce/label/c.quantic_NumberInputMaximum";
import apply from "@salesforce/label/c.quantic_Apply";
import numberInputApply from "@salesforce/label/c.quantic_NumberInputApply";
import messageWhenRangeOverflow from '@salesforce/label/c.quantic_MessageWhenRangeOverflow';
import messageWhenRangeUnderflow from '@salesforce/label/c.quantic_MessageWhenRangeUnderflow';

/** @typedef {import("coveo").NumericFacetState} NumericFacetState */
/** @typedef {import("coveo").NumericFilterState} NumericFilterState*/
/** @typedef {import("coveo").NumericFacet} NumericFacet */
/** @typedef {import("coveo").NumericFilter} NumericFilter */
/** @typedef {import("coveo").NumericFacetValue} NumericFacetValue */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticNumericFacet` component displays facet values as numeric ranges.
 * @category Search
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
   * Whether this facet should contain an input allowing users to set custom ranges.
   * Depending on the field, the input can allow either decimal or integer values.
   *   - `integer`
   *   - `decimal`
   * @api
   * @type {'integer' | 'decimal'}
   */
  @api withInput;
  /*
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

  static attributes = [
    'facetId',
    'field',
    'label',
    'numberOfValues',
    'sortCriteria',
    'rangeAlgorithm',
    'withInput',
    'formattingFunction',
  ]

  /** @type {NumericFacetState} */
  @track state;
  /** @type {NumericFilterState} */
  @track filterState = {
    isLoading: false,
    enabled: true,
    facetId: undefined
  }

  /** @type {NumericFacet} */
  facet;
  /**  @type {NumericFilter} */
  numericFilter;
  /**  @type {SearchStatus} */
  searchStatus;
  /** @type {boolean} */
  showPlaceholder = true;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeFilter;
  /** @type {Function} */
  unsubscribeSearchStatus;

  /** @type {string} */
  start;
  /** @type {string} */
  end;
  /** @type {string} */
  min;
  /** @type {string} */
  max;

  labels = {
    clearFilter,
    clearFilter_plural,
    collapseFacet,
    expandFacet,
    min,
    max,
    numberInputMinimum,
    numberInputMaximum,
    apply,
    numberInputApply,
    messageWhenRangeOverflow,
    messageWhenRangeUnderflow
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

    if(this.numberOfValues > 0) {
      this.initializeFacet(engine);
    }
    if(this.withInput) {
      this.initializeFilter(engine);
    }
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateState());
    registerToStore(this.engineId, Store.facetTypes.NUMERICFACETS, {
      label: this.label,
      facetId: this.facet?.state.facetId ?? this.field,
      format: this.formattingFunction,
      element: this.template.host
    });
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  initializeFacet(engine) {
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

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  initializeFilter(engine) {
    this.numericFilter = CoveoHeadless.buildNumericFilter(engine, {
      options: {
        field: this.field,
        facetId: this.facet?.state.facetId ? `${this.facet.state.facetId}_input` : undefined
      }
    });
    this.unsubscribeFilter = this.numericFilter.subscribe(() => this.updateFilterState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeFilter?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.state = this.facet?.state;
    this.showPlaceholder = this.searchStatus?.state?.isLoading && !this.searchStatus?.state?.hasError && !this.searchStatus?.state?.firstSearchExecuted;
  }

  updateFilterState() {
    this.filterState = this.numericFilter?.state;
    this.start = this.filterState?.range?.start?.toString();
    this.end = this.filterState?.range?.end?.toString();
  }

  get values() {
    return (
      this.state?.values
        .filter((value) => value.numberOfResults || value.state === 'selected')
        .map((value) => {
          return {
            ...value,
            key: `${value.start}..${value.end}`,
            checked: value.state === 'selected',
          };
        }) || []
    );
  }

  get step() {
    return this.withInput ==='integer' ? '1' : 'any';
  }

  /** @returns {HTMLInputElement} */
  get inputMin() {
    return this.template.querySelector('.numeric__input-min');
  }

  /** @returns {HTMLInputElement} */
  get inputMax() {
    return this.template.querySelector('.numeric__input-max');
  }

  get hasActiveValues() {
    return this.state?.hasActiveValues || this.filterState?.range;
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
    return this.filterState?.range ? 1 : this.state.values.filter(({state}) => state === 'selected').length;
  }

  get showValues() {
    return !this.searchStatus?.state?.hasError && !this.filterState?.range && !!this.values.length;
  }

  get clearFilterLabel() {
    if (this.hasActiveValues) {
      const labelName = I18nUtils.getLabelNameWithCount('clearFilter', this.numberOfSelectedValues);
      return `${I18nUtils.format(this.labels[labelName], this.numberOfSelectedValues)}`;
    }
    return '';
  }

  get shouldRenderInput() {
    return this.withInput && this.searchStatus?.state?.hasResults || !!this.filterState?.range;
  }

  get shouldRenderValues() {
    const hasInputRange = !!this.filterState?.range;
    return !hasInputRange && !!this.values.length;
  }

  get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  setValidityParameters() {
    this.inputMin.max = this.max || Number.MAX_VALUE.toString();
    this.inputMax.min = this.min || Number.MIN_VALUE.toString();
    this.inputMin.required = true;
    this.inputMax.required = true;
  }

  resetValidityParameters() {
    this.inputMin.max = Number.MAX_VALUE.toString();
    this.inputMax.min = Number.MIN_VALUE.toString();
    this.inputMin.required = false;
    this.inputMax.required = false;
  }

  /** 
   * @param {CustomEvent<{value: string}>} evt
   */
  onSelectValue(evt) {
    const item = this.values.find((value) => this.formattingFunction(value) === evt.detail.value);
    this.facet.toggleSelect(item);
  }

  clearSelections() {
    if(this.filterState?.range) {
      this.numericFilter.clear();
    }
    this.facet?.deselectAll();
    if(this.withInput) {
      this.resetValidityParameters();
    
      this.allInputs.forEach((input) => {
        // @ts-ignore
        input.checkValidity();
        // @ts-ignore
        input.reportValidity();
      });
    }
  }

  toggleFacetVisibility() {
    this._isCollapsed = !this.isCollapsed;
  }

  preventDefault(evt) {
    evt.preventDefault();
  }

  /**
   * @param {Event} evt
  */
  onApply(evt) {
    evt.preventDefault();

    this.setValidityParameters();
    // @ts-ignore
    const allValid = this.allInputs.reduce((validSoFar, inputCmp) => validSoFar && inputCmp.reportValidity(), true);
    this.resetValidityParameters();

    if (!allValid) {
      return;
    }

    if(this.numberOfValues > 0) {
      const engine = getHeadlessBindings(this.engineId).engine;
      engine.dispatch(CoveoHeadless.loadNumericFacetSetActions(engine).deselectAllNumericFacetValues(this.facet.state.facetId));
    }
    
    this.numericFilter.setRange({
      start: this.inputMin ? Number(this.inputMin.value) : undefined,
      end: this.inputMax ? Number(this.inputMax.value) : undefined
    });
  }

  onChangeMin(evt) {
    this.min = evt.target.value;
  }

  onChangeMax(evt) {
    this.max = evt.target.value;
  }

  resetValidationErrors() {
    this.allInputs.forEach((input) => {
      // @ts-ignore
      input.setCustomValidity('');
      // @ts-ignore
      input.reportValidity();
    });
  }

  get allInputs() {
    return [...this.template.querySelectorAll('lightning-input')];
  }

  get numberInputMinimumLabel() {
    return I18nUtils.format(this.labels.numberInputMinimum, this.label);
  }

  get numberInputMaximumLabel() {
    return I18nUtils.format(this.labels.numberInputMaximum, this.label);
  }

  get numberInputApplyLabel() {
    return I18nUtils.format(this.labels.numberInputApply, this.label);
  }

  get customMessageOverflow() {
    return I18nUtils.format(this.labels.messageWhenRangeOverflow, this.max);
  }
  
  get customMessageUnderflow() {
    return I18nUtils.format(this.labels.messageWhenRangeUnderflow, this.min);
  }
}
