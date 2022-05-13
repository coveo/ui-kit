import {
  getHeadlessBindings,
  initializeWithHeadless,
  registerComponentForInit,
  registerToStore,
} from 'c/quanticHeadlessLoader';
import {
  DateUtils,
  fromSearchApiDate,
  I18nUtils,
  RelativeDateFormatter,
  Store,
} from 'c/quanticUtils';
import {api, LightningElement, track} from 'lwc';

import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import startLabel from '@salesforce/label/c.quantic_StartLabel';
import endLabel from '@salesforce/label/c.quantic_EndLabel';
import apply from '@salesforce/label/c.quantic_Apply';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").DateFacet} DateFacet */
/** @typedef {import("coveo").DateFacetState} DateFacetState */
/** @typedef {import("coveo").DateFilter} DateFilter */
/** @typedef {import("coveo").DateFilterState} DateFilterState */
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
 * @property {Function} checkValidity
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

/**
 * The `QuanticTimeframeFacet` component displays dates as relative ranges.
 * @category Search
 * @example
 * <c-quantic-timeframe-facet engine-id={engineId} field="Date" label="Indexed Date" is-collapsed with-date-picker>
 *   <c-quantic-timeframe period="past" unit="year" amount="10" label="Past decade"></c-quantic-timeframe>
 * </c-quantic-timeframe-facet>
 */
export default class QuanticTimeframeFacet extends LightningElement {
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
   * The index field whose values the facet should use.
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
   * Whether the facet should display custom range inputs.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api withDatePicker = false;
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
  /**
   * Whether not to exclude the parents of folded results when estimating the result count for each facet value.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api noFilterFacetCount = false;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * @api
   * @type {number}
   * @defaultValue `1000`
   */
  @api injectionDepth = 1000;

  static attributes = [
    'facetId',
    'field',
    'label',
    'withDatePicker',
    'noFilterFacetCount',
    'injectionDepth',
  ]

  /** @type {DateFacetState} */
  @track facetState;
  /** @type {DateFilterState} */
  @track dateFilterState;
  showPlaceholder = true;
  hasResults = false;
  /** @type {string} */
  startDate;
  /** @type {string} */
  endDate;

  /** @type {SearchStatus} */
  searchStatus;
  /** @type {Function} */
  unsubscribeSearchStatus;
  /** @type {DateFacet} */
  facet;
  /** @type {Function} */
  unsubscribeFacet;
  /** @type {DateFilter} */
  dateFilter;
  /** @type {Function} */
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

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  disconnectedCallback() {
    this.unsubscribeFacet?.();
    this.unsubscribeSearchStatus?.();
    this.unsubscribeDateFilter?.();
  }

  /**
   * Gets whether to show the facet.
   */
  get showFacet() {
    const facetIsActivated = this.hasActiveValues || !!this.dateFilterState.range;
    const canRefineWithCustomRange = this.hasResults && this.withDatePicker;
    const canRefineWithTimeframes = this.hasResults && this.formattedValues.length > 0;

    return facetIsActivated || canRefineWithCustomRange || canRefineWithTimeframes;
  }

  /**
   * Gets whether to show the facet values.
   * @returns {boolean}
   */
  get showValues() {
    return this._showValues;
  }

  get startDateNoTime() {
    return this.startDate
      ? DateUtils.trimIsoTime(this.startDate)
      : '';
  }

  get endDateNoTime() {
    return this.endDate
      ? DateUtils.trimIsoTime(this.endDate)
      : '';
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
      .filter((value) => value.numberOfResults > 0 || value.state === 'selected')
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

  /**
   * @param {Event} evt 
   */
   preventDefault(evt) {
    evt.preventDefault();
  }

  /**
   * @param {SearchEngine} engine 
   */
  initialize = (engine) => {
    this.initializeSearchStatusController(engine);
    this.initializeFacetController(engine);
    this.initializeDateFilterController(engine);
    registerToStore(this.engineId, Store.facetTypes.DATEFACETS, {
      label: this.label,
      facetId: this.facet.state.facetId,
      format: this.formatFacetValue,
      element: this.template.host
    });
  };

  /**
   * @param {SearchEngine} engine 
   */
  initializeSearchStatusController(engine) {
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateSearchStatusState()
    );
  }

  /**
   * @param {SearchEngine} engine 
   */
  initializeFacetController(engine) {
    this.facet = CoveoHeadless.buildDateFacet(engine, {
      options: {
        field: this.field,
        currentValues: this.currentValues,
        generateAutomaticRanges: false,
        sortCriteria: 'descending',
        filterFacetCount: !this.noFilterFacetCount,
        injectionDepth: Number(this.injectionDepth),
        facetId: this.facetId ?? this.field,
      },
    });
    this.unsubscribeFacet = this.facet.subscribe(() => this.updateFacetState());
  }

  /**
   * @param {SearchEngine} engine 
   */
  initializeDateFilterController(engine) {
    const dateFilterId = (this.facetId || this.field) + '_input';

    this.dateFilter = CoveoHeadless.buildDateFilter(engine, {
      options: {
        field: this.field,
        facetId: dateFilterId,
        filterFacetCount: !this.noFilterFacetCount,
        injectionDepth: Number(this.injectionDepth),
      },
    });
    this.unsubscribeDateFilter = this.dateFilter.subscribe(() =>
      this.updateDateFilterState()
    );
  }

  updateSearchStatusState() {
    this.showPlaceholder =
      !this.searchStatus?.state?.hasError &&
      !this.searchStatus?.state?.firstSearchExecuted;

    this.hasResults = this.searchStatus.state.hasResults;
  }

  updateFacetState() {
    this.facetState = this.facet?.state;
  }

  updateDateFilterState() {
    this.dateFilterState = this.dateFilter.state;

    if (this.dateFilterState.range) {
      this.tryUpdateFilterRange(this.dateFilterState.range.start, this.dateFilterState.range.end);
      this.enableRangeValidation(false);
      this._showValues = false;
    } else {
      this.startDate = '';
      this.endDate = '';
      this.disableRangeValidation();
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

      this.startDate = DateUtils.toLocalIsoDate(start);
      this.endDate = DateUtils.toLocalIsoDate(end);
    } catch (err) {
      // These are most likely relative dates, we can just skip.
    }
  }

  /**
   * Formats the specified date range. The range could use fixed or relative dates.
   * @param {DateFacetValue} facetValue The date facet value.
   * @returns {string} The formatted date range.
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

  /**
   * @param {CustomEvent<{value: string}>} evt 
   */
  onSelectValue(evt) {
    const item = this.formattedValues.find(
      (value) => value.label === evt.detail.value
    );
    this.facet.toggleSingleSelect(item);
  }

  toggleFacetVisibility() {
    this._isCollapsed = !this.isCollapsed;
  }

  clearSelections() {
    this._showValues = true;

    if (this.withDatePicker && this.dateFilter?.state.range) {
      this.dateFilter.clear();
      this.disableRangeValidation();
      return;
    }
    this.facet.deselectAll();
  }

  /**
   * @param {Event} evt
   */
  handleStartDateChange(evt) {
    evt.preventDefault();
    this.enableRangeValidation(false);
  }

  handleStartDateBlur() {
    // The inputs are validated on the blur event so the validation error
    // messages contain the updated datepicker value.

    const isFilled = this.startDatepicker.value && this.endDatepicker.value;
    const isEmpty = !this.startDatepicker.value && !this.endDatepicker.value;

    if (isFilled || isEmpty) {
      this.validateRange();
    }
  }

  /**
   * @param {Event} evt
   */
  handleEndDateChange(evt) {
    evt.preventDefault();
    this.enableRangeValidation(false);
  }

  handleEndDateBlur() {
    // The inputs are validated on the blur event so the validation error
    // messages contain the updated datepicker value.

    const isFilled = this.startDatepicker.value && this.endDatepicker.value;
    const isEmpty = !this.startDatepicker.value && !this.endDatepicker.value;

    if (isFilled || isEmpty) {
      this.validateRange();
    }
  }

  /**
   * @param {Event} evt
   */
  handleApply(evt) {
    // This is required to prevent a full postback of the page.
    evt.preventDefault();

    // The required fields validation is forced because we want the form
    // to show up as invalid when empty.
    this.enableRangeValidation(true);
    if (!this.validateRange()) {
      return;
    }

    const startDate = DateUtils.fromLocalIsoDate(this.startDatepicker.value, 0, 0, 0);
    const endDate = DateUtils.fromLocalIsoDate(this.endDatepicker.value, 23, 59, 59);

    this.updateRangeInHeadless(startDate, endDate);
  }

  enableRangeValidation(forceRequired) {
    if (!this.startDatepicker || !this.endDatepicker) {
      return;
    }

    const hasStartDate = Boolean(this.startDatepicker?.value);
    const hasEndDate = Boolean(this.endDatepicker?.value);
    const shouldValidate = forceRequired || hasStartDate || hasEndDate;

    this.startDatepicker.required = shouldValidate;
    this.endDatepicker.required = shouldValidate;
    this.startDatepicker.max = shouldValidate && hasEndDate ? DateUtils.trimIsoTime(this.endDatepicker.value) : '';
  }

  disableRangeRequirement() {
    if (!this.startDatepicker || !this.endDatepicker) {
      return;
    }

    this.startDatepicker.required = false;
    this.endDatepicker.required = false;
  }

  disableRangeValidation() {
    this.disableRangeRequirement();

    if (this.startDatepicker) {
      this.startDatepicker.max = '';
    }
  }

  resetRangeValidation() {
    this.disableRangeRequirement();
    this.validateRange();
  }

  validateRange() {
    this.startDatepicker.reportValidity();
    this.endDatepicker.reportValidity();

    return this.startDatepicker.checkValidity() && this.endDatepicker.checkValidity();
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
        start: DateUtils.toLocalSearchApiDate(startDate),
        end: DateUtils.toLocalSearchApiDate(endDate),
      })
    );
  }
}
