import apply from '@salesforce/label/c.quantic_Apply';
import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import clearFilterFacet from '@salesforce/label/c.quantic_ClearFilterFacet';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import endLabel from '@salesforce/label/c.quantic_EndLabel';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';
import startLabel from '@salesforce/label/c.quantic_StartLabel';
import timeframeInputApply from '@salesforce/label/c.quantic_TimeframeInputApply';
import {
  getHeadlessBundle,
  initializeWithHeadless,
  registerComponentForInit,
  registerToStore,
  getBueno,
} from 'c/quanticHeadlessLoader';
import {
  DateUtils,
  fromSearchApiDate,
  I18nUtils,
  RelativeDateFormatter,
  Store,
  generateFacetDependencyConditions,
} from 'c/quanticUtils';
import {api, LightningElement, track} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").InsightEngine} InsightEngine */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").DateFacet} DateFacet */
/** @typedef {import("coveo").DateFacetState} DateFacetState */
/** @typedef {import("coveo").DateFilter} DateFilter */
/** @typedef {import("coveo").DateFilterState} DateFilterState */
/** @typedef {import("coveo").DateRangeRequest} DateRangeRequest */
/** @typedef {import("coveo").DateFacetValue} DateFacetValue */
/** @typedef {import("coveo").RelativeDatePeriod} RelativeDatePeriod */
/** @typedef {import("coveo").RelativeDateUnit} RelativeDateUnit */
/** @typedef {import("coveo").FacetConditionsManager} FacetConditionsManager */
/** @typedef {import('../quanticUtils/facetDependenciesUtils').DependsOn} DependsOn */
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
 * @typedef FocusTarget
 * @type {object}
 * @property {'facetValue' | 'facetHeader' | 'applyButton'} type
 * @property {string} [value]
 * @property {number} [index]
 */

/**
 * The `QuanticTimeframeFacet` component displays dates as relative ranges.
 * @category Search
 * @category Insight Panel
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
  /**
   * This property defines the relationship between this facet and a parent facet, indicating
   * the specific parent facet that this facet relies on and the selected value required
   * from that parent facet for this facet to be displayed.
   *
   * When this property is defined, the facet will only display if the specified `parentFacetId`
   * has the `expectedValue` selected. If `expectedValue` is omitted or set to `undefined`,
   * the facet will display as long as any value is selected in the parent facet.
   *
   * **Supported facets:** Dependencies can only be created on a basic or category facet.
   * Dependencies on numeric, timeframe, or date facets are not supported.
   *
   * For example usage and more details, see:
   * https://docs.coveo.com/en/quantic/latest/usage/display-facet-based-on-selection-of-another-facet/
   *
   * @api
   * @type {DependsOn}
   */
  @api dependsOn;

  static attributes = [
    'facetId',
    'field',
    'label',
    'withDatePicker',
    'noFilterFacetCount',
    'injectionDepth',
    'dependsOn',
  ];

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
  /** @type {AnyHeadless} */
  headless;
  /** @type {FocusTarget} */
  focusTarget;
  /** @type {boolean} */
  focusShouldBeInFacet = false;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {FacetConditionsManager} */
  dateFacetConditionsManager;
  /** @type {FacetConditionsManager} */
  dateFilterConditionsManager;
  /** @type {SearchEngine | InsightEngine} */
  engine;

  _isCollapsed = false;
  _showValues = true;

  labels = {
    collapseFacet,
    expandFacet,
    clearFilter,
    clearFilterFacet,
    startLabel,
    endLabel,
    apply,
    timeframeInputApply,
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    if (this.focusShouldBeInFacet && !this.facet?.state?.isLoading) {
      this.setFocusOnTarget();
      this.focusTarget = null;
    }
  }

  disconnectedCallback() {
    this.unsubscribeFacet?.();
    this.unsubscribeSearchStatus?.();
    this.unsubscribeDateFilter?.();
    this.dateFacetConditionsManager?.stopWatching();
    this.dateFilterConditionsManager?.stopWatching();
  }

  get isFacetEnabled() {
    return this.facetState?.enabled;
  }

  /**
   * Gets whether to show the facet.
   */
  get showFacet() {
    const canRefineWithCustomRange =
      this.hasResults && this.shouldDisplayDatePicker;
    const canRefineWithTimeframes =
      this.hasResults && this.formattedValues.length > 0;
    return (
      this.hasActiveValues ||
      canRefineWithCustomRange ||
      canRefineWithTimeframes
    );
  }

  /**
   * Indicates whether to display the date picker.
   */
  get shouldDisplayDatePicker() {
    if (!this.withDatePicker) {
      return false;
    }
    if (this.dateFilterState?.range) {
      return true;
    }
    if (!this.hasResults) {
      return false;
    }
    const atLeastOneValueWithResultsOrActive = this.facetState?.values.some(
      (value) => value.numberOfResults || value.state === 'selected'
    );
    return atLeastOneValueWithResultsOrActive;
  }

  /**
   * Gets whether to show the facet values.
   * @returns {boolean}
   */
  get showValues() {
    return this._showValues;
  }

  get startDateNoTime() {
    return this.startDate ? DateUtils.trimIsoTime(this.startDate) : '';
  }

  get endDateNoTime() {
    return this.endDate ? DateUtils.trimIsoTime(this.endDate) : '';
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
        ? this.headless.buildDateRange({
            start: {
              period: timeframe.period,
              unit: timeframe.unit,
              amount: timeframe.amount,
            },
            end: {period: 'now'},
          })
        : this.headless.buildDateRange({
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
      .filter(
        (value) => value.numberOfResults > 0 || value.state === 'selected'
      )
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
    return this.facetState?.hasActiveValues || !!this.dateFilterState?.range;
  }

  get clearFilterLabel() {
    return I18nUtils.format(this.labels.clearFilter);
  }

  get clearFilterAriaLabelValue() {
    return I18nUtils.format(this.labels.clearFilterFacet, this.field);
  }

  get datepickerFormat() {
    return I18nUtils.getShortDatePattern();
  }

  /**
   * @returns {DatepickerElement|null}
   */
  get startDatepicker() {
    return this.withDatePicker
      ? // @ts-ignore
        this.template.querySelector('.timeframe-facet__start-input')
      : null;
  }

  /**
   * @returns {DatepickerElement|null}
   */
  get endDatepicker() {
    return this.withDatePicker
      ? // @ts-ignore
        this.template.querySelector('.timeframe-facet__end-input')
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
    this.engine = engine;
    this.validateDependsOnProperty();
    this.headless = getHeadlessBundle(this.engineId);
    this.initializeSearchStatusController(engine);
    this.initializeFacetController(engine);
    if (this.withDatePicker) {
      this.initializeDateFilterController(engine);
    }
    registerToStore(this.engineId, Store.facetTypes.DATEFACETS, {
      label: this.label,
      facetId: this.facet.state.facetId,
      format: this.formatFacetValue,
      element: this.template.host,
      metadata: {timeframes: this.timeframes},
    });
  };

  validateDependsOnProperty() {
    if (this.dependsOn) {
      getBueno(this).then(() => {
        const {parentFacetId, expectedValue} = this.dependsOn;
        if (!Bueno.isString(parentFacetId)) {
          console.error(
            `The ${this.field} ${this.template.host.localName} requires dependsOn.parentFacetId to be a valid string.`
          );
          this.setInitializationError();
        }
        if (expectedValue && !Bueno.isString(expectedValue)) {
          console.error(
            `The ${this.field} ${this.template.host.localName} requires dependsOn.expectedValue to be a valid string.`
          );
          this.setInitializationError();
        }
      });
    }
  }

  /**
   * @param {SearchEngine} engine
   */
  initializeSearchStatusController(engine) {
    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateSearchStatusState()
    );
  }

  /**
   * @param {SearchEngine} engine
   */
  initializeFacetController(engine) {
    this.facet = this.headless.buildDateFacet(engine, {
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
    if (this.dependsOn) {
      this.dateFacetConditionsManager = this.initFacetConditionManager(
        engine,
        this.facet.state?.facetId
      );
    }
  }

  /**
   * @param {SearchEngine} engine
   */
  initializeDateFilterController(engine) {
    const dateFilterId = (this.facetId || this.field) + '_input';

    this.dateFilter = this.headless.buildDateFilter(engine, {
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
    if (this.dependsOn) {
      this.dateFilterConditionsManager = this.initFacetConditionManager(
        engine,
        this.dateFilter.state?.facetId
      );
    }
  }

  initFacetConditionManager(engine, facetId) {
    return this.headless.buildFacetConditionsManager(engine, {
      facetId,
      conditions: generateFacetDependencyConditions({
        [this.dependsOn.parentFacetId]: this.dependsOn.expectedValue,
      }),
    });
  }

  updateSearchStatusState() {
    this.showPlaceholder =
      !this.searchStatus?.state?.hasError &&
      !this.searchStatus?.state?.firstSearchExecuted;

    this.hasResults = this.searchStatus.state.hasResults;
    this.sendFacetRenderEvent();
  }

  updateFacetState() {
    this.facetState = this.facet?.state;
    this.sendFacetRenderEvent();
  }

  updateDateFilterState() {
    this.dateFilterState = this.dateFilter.state;

    if (this.dateFilterState.range) {
      this.tryUpdateFilterRange(
        this.dateFilterState.range.start,
        this.dateFilterState.range.end
      );
      this.enableRangeValidation(false);
      this._showValues = false;
    } else {
      this.startDate = '';
      this.endDate = '';
      this.disableRangeValidation();
      this._showValues = true;
    }
    this.sendFacetRenderEvent();
  }

  /**
   * Fires the 'quantic__renderfacet' custom event.
   */
  sendFacetRenderEvent() {
    const renderFacetEvent = new CustomEvent('quantic__renderfacet', {
      detail: {
        id: this.facetId ?? this.field,
        shouldRenderFacet: this.showFacet,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(renderFacetEvent);
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
      const startDate = this.headless.deserializeRelativeDate(facetValue.start);
      const endDate = this.headless.deserializeRelativeDate(facetValue.end);

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
    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'facetValue',
      value: evt.detail.value,
    };
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
    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'facetHeader',
    };
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

    const startDate = DateUtils.fromLocalIsoDate(
      this.startDatepicker.value,
      0,
      0,
      0
    );
    const endDate = DateUtils.fromLocalIsoDate(
      this.endDatepicker.value,
      23,
      59,
      59
    );

    this.updateRangeInHeadless(startDate, endDate);

    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'applyButton',
    };
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
    this.startDatepicker.max =
      shouldValidate && hasEndDate
        ? DateUtils.trimIsoTime(this.endDatepicker.value)
        : '';
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

    return (
      this.startDatepicker.checkValidity() && this.endDatepicker.checkValidity()
    );
  }

  updateRangeInHeadless(startDate, endDate) {
    this.engine.dispatch(
      this.headless
        .loadDateFacetSetActions(this.engine)
        .deselectAllDateFacetValues(this.facet.state.facetId)
    );

    this.dateFilter.setRange(
      this.headless.buildDateRange({
        start: DateUtils.toLocalSearchApiDate(startDate),
        end: DateUtils.toLocalSearchApiDate(endDate),
      })
    );
  }

  get ariaLabelValue() {
    return I18nUtils.format(this.labels.timeframeInputApply, this.field);
  }

  /**
   * Sets the focus on the target element.
   */
  setFocusOnTarget() {
    this.focusShouldBeInFacet = false;
    if (!this.focusTarget) {
      return;
    }

    if (this.focusTarget.type === 'facetHeader') {
      this.setFocusOnHeader();
    } else if (this.focusTarget.type === 'applyButton') {
      this.setFocusOnApplyButton();
    } else if (this.focusTarget.type === 'facetValue') {
      if (this.focusTarget.value) {
        const facetValueIndex = this.formattedValues.findIndex(
          (value) => value.label === this.focusTarget.value
        );
        this.focusTarget.index = facetValueIndex >= 0 ? facetValueIndex : 0;
        this.setFocusOnFacetValue();
      }
    }
  }

  /**
   * Sets the focus on the target facet value.
   */
  setFocusOnFacetValue() {
    const facetValues = this.template.querySelectorAll('c-quantic-facet-value');
    const focusTarget = facetValues[this.focusTarget.index];
    if (focusTarget) {
      // @ts-ignore
      focusTarget.setFocus();
    }
  }

  /**
   * Sets the focus on the facet header.
   */
  setFocusOnHeader() {
    const focusTarget = this.template.querySelector('c-quantic-card-container');
    if (focusTarget) {
      // @ts-ignore
      focusTarget.setFocusOnHeader();
    }
  }

  /**
   * Sets the focus on the apply button.
   */
  setFocusOnApplyButton() {
    const focusTarget = this.template.querySelector('.timeframe-facet__apply');
    if (focusTarget) {
      // @ts-ignore
      focusTarget.focus();
    }
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
