import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBindings
} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';
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

export default class QuanticNumericFacet extends LightningElement {
  /** @type {import("coveo").NumericFacetState} */
  // @ts-ignore TODO: Check CategoryFacetState typing and integration with LWC/Quantic
  @track state = {
    values: [],
  };
  /** @type {import("coveo").NumericFilterState} */
  @track stateFilter = {
    isLoading: false,
    facetId: undefined
  }

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
  /** @type {import("coveo").RangeFacetSortCriterion} */
  @api sortCriteria = 'ascending';
  /** @type {import("coveo").RangeFacetRangeAlgorithm} */
  @api rangeAlgorithm = 'equiprobable';
  /** @type {(any) => string} */
  @api formattingFunction = (item) => `${new Intl.NumberFormat(LOCALE).format(
    item.start
  )} - ${new Intl.NumberFormat(LOCALE).format(
    item.end
  )}`;
  /** @type {boolean} */
  @api noInput;
  /** @type {boolean} */
  @api get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(collapsed) {
    this._isCollapsed = collapsed;
  }
  /** @type {boolean} */
  _isCollapsed = false;
  /** @type {import("coveo").NumericFacet} */
  facet;
  /**  @type {import("coveo").NumericFilter} */
  numericFilter;
  /**  @type {import("coveo").SearchStatus} */
  searchStatus;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribeFilter;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribeSearchStatus;
  isSelected=true;

  minSafeInteger = Number.MIN_SAFE_INTEGER;
  maxSafeInteger = Number.MAX_SAFE_INTEGER;

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
    numberInputApply
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
    if(!this.noInput) {
      this.initializeFilter(engine);
    }
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateState());
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  initializeFilter(engine) {
     this.numericFilter = CoveoHeadless.buildNumericFilter(engine, {
      options: {
        field: this.field,
        facetId: this.facetId ?? this.field
      }
    });
    this.unsubscribeFilter = this.numericFilter.subscribe(() => this.updateStateFilter());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeFilter?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.state = this.facet.state;
  }

  updateStateFilter() {
    this.stateFilter = this.numericFilter.state;
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

  /** @returns {HTMLInputElement} */
  get inputMin() {
    return this.template.querySelector('.numeric__input-min');
  }

  /** @returns {HTMLInputElement} */
  get inputMax() {
    return this.template.querySelector('.numeric__input-max');
  }

  get hasValues() {
    return this.values.length !== 0;
  }

  get hasActiveValues() {
    return this.state.hasActiveValues;
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

  get start() {
    return this.isSelected ? '' : this.stateFilter?.range?.start;
  }

  get end() {
    return this.isSelected ? '' :  this.stateFilter?.range?.end;
  }

  get showValues() {
    return !this.searchStatus?.state?.hasError && (this.isSelected || !this.stateFilter?.range) && !!this.values.length;
    }

  get clearFilterLabel() {
    if (this.hasActiveValues) {
      const labelName = I18nUtils.getLabelNameWithCount('clearFilter', this.numberOfSelectedValues);
      return `${I18nUtils.format(this.labels[labelName], this.numberOfSelectedValues)}`;
    }
    return '';
  }

  get minValue() {
    return this.inputMin?.value;
  }

  get maxValue() {
    return this.inputMax?.value;
  }

  setValidityParameters() {
    this.inputMin.max = this.maxValue.toString() || this.maxSafeInteger.toString();
    this.inputMax.min = this.minValue.toString() || this.minSafeInteger.toString();
    this.inputMin.required = true;
    this.inputMax.required = true;
  }

  resetValidityParameters() {
    this.inputMin.max = this.maxSafeInteger.toString();
    this.inputMax.min = this.minSafeInteger.toString();
    this.inputMin.required = false;
    this.inputMax.required = false;
  }
  /**
   * @param {CustomEvent<import("coveo").NumericFacetValue>} evt
   */
  onSelect(evt) {
    this.isSelected = true;
    this.facet.toggleSelect(evt.detail);
    console.log(this.stateFilter.range);
  }

  clearSelections() {
    this.isSelected = true;
    if(this.stateFilter?.range) {
      this.numericFilter.clear();
    }
    this.resetValidityParameters();
    this.facet?.deselectAll();
  }

  toggleFacetVisibility() {
    this._isCollapsed = !this.isCollapsed;
  }

  preventDefault(evt) {
    evt.preventDefault();
  }

  onApply(evt) {
    evt.preventDefault();
    this.setValidityParameters();

    const allValid = [...this.template.querySelectorAll('lightning-input')]
      .reduce((validSoFar, inputCmp) => {
        return validSoFar && inputCmp.reportValidity();
      }, true);
      
    this.resetValidityParameters();

    if (!allValid) {
      return;
    }
    this.isSelected = false;
    const engine = getHeadlessBindings(this.engineId).engine;
    engine.dispatch(CoveoHeadless.loadNumericFacetSetActions(engine).deselectAllNumericFacetValues(this.facet.state.facetId));
    this.numericFilter.setRange({
      start: Number(this.inputMin?.value),
      end: Number(this.inputMax?.value)
    });
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
}
