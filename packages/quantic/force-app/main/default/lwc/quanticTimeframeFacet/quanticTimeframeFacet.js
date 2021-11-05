import {
  getHeadlessBindings,
  initializeWithHeadless,
  registerComponentForInit,
} from 'c/quanticHeadlessLoader';
import {
  fromLocalIsoDate,
  fromSearchApiDate,
  I18nUtils,
  RelativeDateFormatter,
  toLocalIsoDate,
  toLocalSearchApiDate,
} from 'c/quanticUtils';
import {api, LightningElement, track} from 'lwc';

import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import startLabel from '@salesforce/label/c.quantic_StartLabel';
import endLabel from '@salesforce/label/c.quantic_EndLabel';
import apply from '@salesforce/label/c.quantic_Apply';

/** @typedef {import("coveo").DateRangeRequest} DateRangeRequest */
/** @typedef {import("coveo").DateFacetValue} DateFacetValue */
/** @typedef {import("coveo").RelativeDatePeriod} RelativeDatePeriod */
/** @typedef {import("coveo").RelativeDateUnit} RelativeDateUnit */
/**
 * @typedef {Object} DatepickerElement
 * @property {string} min
 * @property {string} max
 * @property {string} value
 * @property {boolean} required
 * @property {Function} reportValidity
 */
/**
 * @typedef {Object} TimeframeElement
 * @property {RelativeDatePeriod} period
 * @property {RelativeDateUnit} unit
 * @property {(string|number)} amount
 * @property {string} label
 */
/**
 * @typedef {Object} Timeframe
 * @property {RelativeDatePeriod} period
 * @property {RelativeDateUnit} unit
 * @property {number} amount
 * @property {string} label
 */

export default class QuanticTimeframeFacet extends LightningElement {
  @api engineId;
  @api facetId;
  @api field;
  @api label = 'no-label';
  @api withDatePicker = false;
  @api get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(collapsed) {
    this._isCollapsed = collapsed;
  }
  @api noFilterFacetCount = false;
  @api injectionDepth = 1000;

  @track facetState;
  @track dateFilterState;
  showPlaceholder = true;
  startDate;
  endDate;

  searchStatus;
  unsubscribeSearchStatus;
  facet;
  unsubscribeFacet;
  dateFilter;
  unsubscribeDateFilter;

  _isCollapsed = false;
  _showValues = true;

  labels = {
    collapseFacet,
    expandFacet,
    clearFilter,
    startLabel,
    endLabel,
    apply,
  };

  /**
   * Gets whether to show the facet values.
   * @returns {boolean}
   */
  get showValues() {
    return this._showValues;
  }

  /**
   * Gets the specified timeframes.
   * @returns {Timeframe[]} The specified timeframes.
   */
  get timeframes() {
    /** @type {TimeframeElement[]} */
    // @ts-ignore
    const elements = Array.from(this.querySelectorAll('c-quantic-timeframe'));

    return elements.map((el) => {
      const amount =
        typeof el.amount === 'string' ? parseInt(el.amount, 10) : el.amount;

      return {
        period: el.period,
        unit: el.unit,
        amount: amount,
        label: el.label,
      };
    });
  }

  /**
   * Gets the relative date ranges to request to the platform.
   * @returns {DateRangeRequest[]} The relative date ranges.
   */
  get currentValues() {
    return this.timeframes.map((timeframe) => {
      return timeframe.period === 'past'
        ? CoveoHeadless.buildDateRange({
            start: {
              period: timeframe.period,
              unit: timeframe.unit,
              amount: timeframe.amount,
            },
            end: {period: 'now'},
          })
        : CoveoHeadless.buildDateRange({
            start: {period: 'now'},
            end: {
              period: timeframe.period,
              unit: timeframe.unit,
              amount: timeframe.amount,
            },
          });
    });
  }

  /**
   * Gets the facet values with the formatting applied.
   */
  get formattedValues() {
    const values = this.facetState?.values || [];

    return values
      .filter((value) => value.numberOfResults > 0)
      .map((value) => ({
        ...value,
        label: this.formatFacetValue(value),
        key: JSON.stringify([value.start, value.end]),
        selected: value.state === 'selected',
      }));
  }

  get actionButtonIcon() {
    return this.isCollapsed ? 'utility:add' : 'utility:dash';
  }

  get actionButtonCssClasses() {
    return this.isCollapsed ? 'facet__expand' : 'facet__collapse';
  }

  get actionButtonLabel() {
    const label = this.isCollapsed
      ? this.labels.expandFacet
      : this.labels.collapseFacet;
    return I18nUtils.format(label, this.label);
  }

  get hasActiveValues() {
    return (
      this.formattedValues.some((v) => v.selected) || this.dateFilterState.range
    );
  }

  get clearFilterLabel() {
    return I18nUtils.format(this.labels.clearFilter);
  }

  get datepickerFormat() {
    return I18nUtils.getShortDatePattern();
  }

  /**
   * @returns {DatepickerElement|null}
   */
  get startDatepicker() {
    // @ts-ignore
    return this.withDatePicker
      ? this.template.querySelector('.timeframe-facet__start-input')
      : null;
  }

  /**
   * @returns {DatepickerElement|null}
   */
  get endDatepicker() {
    // @ts-ignore
    return this.withDatePicker
      ? this.template.querySelector('.timeframe-facet__end-input')
      : null;
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.initializeSearchStatusController(engine);
    this.initializeFacetController(engine);
    this.initializeDateFilterController(engine);
  };

  initializeSearchStatusController(engine) {
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateSearchStatusState()
    );
  }

  initializeFacetController(engine) {
    this.facet = CoveoHeadless.buildDateFacet(engine, {
      options: {
        field: this.field,
        currentValues: this.currentValues,
        generateAutomaticRanges: false,
        sortCriteria: 'descending',
        filterFacetCount: !this.noFilterFacetCount,
        injectionDepth: this.injectionDepth,
        facetId: this.facetId ?? this.field,
      },
    });
    this.unsubscribeFacet = this.facet.subscribe(() => this.updateFacetState());
  }

  initializeDateFilterController(engine) {
    const dateFilterId = (this.facetId || this.field) + '_input';

    this.dateFilter = CoveoHeadless.buildDateFilter(engine, {
      options: {
        field: this.field,
        facetId: dateFilterId,
        filterFacetCount: !this.noFilterFacetCount,
        injectionDepth: this.injectionDepth,
      },
    });
    this.unsubscribeDateFilter = this.dateFilter.subscribe(() =>
      this.updateDateFilterState()
    );
  }

  disconnectedCallback() {
    this.unsubscribeFacet?.();
    this.unsubscribeSearchStatus?.();
    this.unsubscribeDateFilter?.();
  }

  updateSearchStatusState() {
    this.showPlaceholder =
      !this.searchStatus?.state?.hasError &&
      !this.searchStatus?.state?.firstSearchExecuted;
  }

  updateFacetState() {
    this.facetState = this.facet?.state;
  }

  updateDateFilterState() {
    this.dateFilterState = this.dateFilter.state;

    if (this.dateFilterState.range) {
      this.tryUpdateFilterRange(this.dateFilterState.range.start, this.dateFilterState.range.end);
      this._showValues = false;
    } else {
      this.startDate = '';
      this.endDate = '';
      this._showValues = true;
    }
  }

  /**
   * Updates the internal start and end dates based on the range coming from headless.
   * If `apiStartDate` and `apiEndDate` represent a relative range, no change is performed.
   * @param {string} apiStartDate The start date in the Search API format.
   * @param {string} apiEndDate The end date in the Search API format.
   */
  tryUpdateFilterRange(apiStartDate, apiEndDate) {
    try {
      const start = new Date(fromSearchApiDate(apiStartDate));
      const end = new Date(fromSearchApiDate(apiEndDate));

      this.startDate = toLocalIsoDate(start);
      this.endDate = toLocalIsoDate(end);
    } catch (err) {
      // These are most likely relative dates, we can just skip.
    }
  }

  /**
   *
   * @param {DateFacetValue} facetValue
   */
  formatFacetValue = (facetValue) => {
    try {
      const startDate = CoveoHeadless.deserializeRelativeDate(facetValue.start);
      const endDate = CoveoHeadless.deserializeRelativeDate(facetValue.end);

      const relativeDate = startDate.period === 'past' ? startDate : endDate;

      const timeframe = this.timeframes?.find(
        (tf) =>
          tf.period === relativeDate.period &&
          tf.unit === relativeDate.unit &&
          tf.amount === relativeDate.amount
      );

      if (timeframe?.label) {
        return timeframe.label;
      }

      return new RelativeDateFormatter().formatRange(startDate, endDate);
    } catch {
      // The facet value is not a relative date. Handle it as a fixed date.
    }

    const start = fromSearchApiDate(facetValue.start);
    const startDate = I18nUtils.formatDate(new Date(start));

    const end = fromSearchApiDate(facetValue.end);
    const endDate = I18nUtils.formatDate(new Date(end));

    return `${startDate} - ${endDate}`;
  };

  onSelectValue(evt) {
    const item = this.formattedValues.find(
      (value) => value.label === evt.detail.value
    );
    this.facet.toggleSingleSelect(item);
  }

  toggleFacetVisibility() {
    this._isCollapsed = !this.isCollapsed;
  }

  preventDefault(evt) {
    evt.preventDefault();
  }

  clearSelections() {
    if (this.withDatePicker) {
      this.dateFilter.clear();

      this.startDatepicker.max = '';
      this.endDatepicker.min = '';
      this.enableRangeValidation(false);
      this.isRangeValid();
    }
    this.facet.deselectAll();

    this._showValues = true;
  }

  /**
   *
   * @param {Event} evt
   */
  handleStartDateChange(evt) {
    evt.preventDefault();
    this.endDatepicker.min = this.startDatepicker.value;
  }

  /**
   *
   * @param {Event} evt
   */
  handleEndDateChange(evt) {
    evt.preventDefault();
    this.startDatepicker.max = this.endDatepicker.value;
  }

  /**
   *
   * @param {Event} evt
   */
  handleApply(evt) {
    evt.preventDefault();

    this.enableRangeValidation(true);
    if (!this.isRangeValid()) {
      return;
    }

    this.enableRangeValidation(false);

    const startDate = fromLocalIsoDate(this.startDatepicker.value, 0, 0, 0);
    const endDate = fromLocalIsoDate(this.endDatepicker.value, 23, 59, 59);

    this.updateRangeInHeadless(startDate, endDate);
  }

  enableRangeValidation(enable) {
    this.startDatepicker.required = enable;
    this.endDatepicker.required = enable;
  }

  isRangeValid() {
    return this.startDatepicker.reportValidity() &&
      this.endDatepicker.reportValidity();
  }

  updateRangeInHeadless(startDate, endDate) {
    const engine = getHeadlessBindings(this.engineId).engine;
    engine.dispatch(
      CoveoHeadless.loadDateFacetSetActions(engine).deselectAllDateFacetValues(
        this.facet.state.facetId
      )
    );

    this.dateFilter.setRange(
      CoveoHeadless.buildDateRange({
        start: toLocalSearchApiDate(startDate),
        end: toLocalSearchApiDate(endDate),
      })
    );
  }
}
