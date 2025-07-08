import LOCALE from '@salesforce/i18n/locale';
import apply from '@salesforce/label/c.quantic_Apply';
import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import clearFilterFacet from '@salesforce/label/c.quantic_ClearFilterFacet';
import clearFilter_plural from '@salesforce/label/c.quantic_ClearFilter_plural';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';
import max from '@salesforce/label/c.quantic_Max';
import messageWhenRangeOverflow from '@salesforce/label/c.quantic_MessageWhenRangeOverflow';
import messageWhenRangeUnderflow from '@salesforce/label/c.quantic_MessageWhenRangeUnderflow';
import min from '@salesforce/label/c.quantic_Min';
import numberInputApply from '@salesforce/label/c.quantic_NumberInputApply';
import numberInputMaximum from '@salesforce/label/c.quantic_NumberInputMaximum';
import numberInputMinimum from '@salesforce/label/c.quantic_NumberInputMinimum';
import {
  registerComponentForInit,
  initializeWithHeadless,
  registerToStore,
  getHeadlessBundle,
  getBueno,
} from 'c/quanticHeadlessLoader';
import {
  I18nUtils,
  Store,
  generateFacetDependencyConditions,
} from 'c/quanticUtils';
import {LightningElement, track, api} from 'lwc';

/** @typedef {import("coveo").NumericFacetState} NumericFacetState */
/** @typedef {import("coveo").NumericFilterState} NumericFilterState*/
/** @typedef {import("coveo").NumericFacet} NumericFacet */
/** @typedef {import("coveo").NumericFilter} NumericFilter */
/** @typedef {import("coveo").NumericFacetValue} NumericFacetValue */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").InsightEngine} InsightEngine */
/** @typedef {import("coveo").FacetConditionsManager} FacetConditionsManager */
/** @typedef {import('../quanticUtils/facetDependenciesUtils').DependsOn} DependsOn */
/**
 * @typedef FocusTarget
 * @type {object}
 * @property {'facetValue' | 'facetHeader' | 'applyButton'} type
 * @property {string} [value]
 * @property {number} [index]
 */

/**
 * The `QuanticNumericFacet` component displays facet values as numeric ranges.
 * @category Search
 * @category Insight Panel
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
   * Whether to display the facet values as checkboxes (multiple selection) or links (single selection). Possible values are 'checkbox', 'link'.
   * @api
   * @type {'checkbox' | 'link'}
   * @defaultValue `'checkbox'`
   */
  @api displayValuesAs = 'checkbox';
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
  @api formattingFunction = (item) =>
    `${new Intl.NumberFormat(LOCALE).format(
      item.start
    )} - ${new Intl.NumberFormat(LOCALE).format(item.end)}`;
  /**
   * Whether this facet should contain an input allowing users to set custom ranges.
   * Depending on the field, the input can allow either decimal or integer values.
   *   - `integer`
   *   - `decimal`
   * @api
   * @type {'integer' | 'decimal'}
   */
  @api withInput;
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
    'displayValuesAs',
    'sortCriteria',
    'rangeAlgorithm',
    'withInput',
    'dependsOn',
  ];

  /** @type {NumericFacetState} */
  @track state;
  /** @type {NumericFilterState} */
  @track filterState = {
    isLoading: false,
    enabled: true,
    facetId: undefined,
  };

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
  /** @type {AnyHeadless} */
  headless;
  /** @type {FocusTarget} */
  focusTarget;
  /** @type {boolean} */
  focusShouldBeInFacet = false;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {FacetConditionsManager} */
  numericFacetConditionsManager;
  /** @type {FacetConditionsManager} */
  numericFilterConditionsManager;
  /** @type {SearchEngine | InsightEngine} */
  engine;

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
    clearFilterFacet,
    collapseFacet,
    expandFacet,
    min,
    max,
    numberInputMinimum,
    numberInputMaximum,
    apply,
    numberInputApply,
    messageWhenRangeOverflow,
    messageWhenRangeUnderflow,
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

  /**
   * @param {SearchEngine | InsightEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.validateDependsOnProperty();
    this.headless = getHeadlessBundle(this.engineId);
    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );

    if (this.numberOfValues > 0) {
      this.initializeFacet();
    }
    if (this.withInput) {
      this.initializeFilter();
    }
    registerToStore(this.engineId, Store.facetTypes.NUMERICFACETS, {
      label: this.label,
      facetId: this.facet?.state.facetId ?? this.field,
      format: this.formattingFunction,
      element: this.template.host,
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

  initializeFacet() {
    this.facet = this.headless.buildNumericFacet(this.engine, {
      options: {
        field: this.field,
        generateAutomaticRanges: true,
        sortCriteria: this.sortCriteria,
        rangeAlgorithm: this.rangeAlgorithm,
        numberOfValues: Number(this.numberOfValues),
        facetId: this.facetId ?? this.field,
      },
    });
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
    if (this.dependsOn) {
      this.numericFacetConditionsManager = this.initFacetConditionManager(
        this.engine,
        this.facet.state?.facetId
      );
    }
  }

  initializeFilter() {
    this.numericFilter = this.headless.buildNumericFilter(this.engine, {
      options: {
        field: this.field,
        facetId: this.facet?.state.facetId
          ? `${this.facet.state.facetId}_input`
          : undefined,
      },
    });
    this.unsubscribeFilter = this.numericFilter.subscribe(() =>
      this.updateFilterState()
    );
    if (this.dependsOn) {
      this.numericFilterConditionsManager = this.initFacetConditionManager(
        this.engine,
        this.numericFilter.state?.facetId
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

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeFilter?.();
    this.unsubscribeSearchStatus?.();
    this.numericFacetConditionsManager?.stopWatching();
    this.numericFilterConditionsManager?.stopWatching();
  }

  updateState() {
    this.state = this.facet?.state;
    this.showPlaceholder =
      this.searchStatus?.state?.isLoading &&
      !this.searchStatus?.state?.hasError &&
      !this.searchStatus?.state?.firstSearchExecuted;

    const renderFacetEvent = new CustomEvent('quantic__renderfacet', {
      detail: {
        id: this.facetId ?? this.field,
        shouldRenderFacet: this.shouldRenderFacet,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(renderFacetEvent);
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
    return this.withInput === 'integer' ? '1' : 'any';
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

  get isFacetEnabled() {
    return this.state?.enabled;
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

  get numberOfSelectedValues() {
    return this.filterState?.range
      ? 1
      : this.state.values.filter(({state}) => state === 'selected').length;
  }

  get showValues() {
    return (
      !this.searchStatus?.state?.hasError &&
      !this.filterState?.range &&
      !!this.values.length
    );
  }

  get clearFilterLabel() {
    if (this.hasActiveValues) {
      const labelName = I18nUtils.getLabelNameWithCount(
        'clearFilter',
        this.numberOfSelectedValues
      );
      return `${I18nUtils.format(
        this.labels[labelName],
        this.numberOfSelectedValues
      )}`;
    }
    return '';
  }

  get clearFilterAriaLabelValue() {
    return `${I18nUtils.format(this.labels.clearFilterFacet, this.field)}`;
  }

  get shouldRenderInput() {
    return (
      (this.withInput && !!this.values.length) || !!this.filterState?.range
    );
  }

  get shouldRenderValues() {
    const hasInputRange = !!this.filterState?.range;
    return !hasInputRange && !!this.values.length;
  }

  get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  get isDisplayAsLink() {
    return this.displayValuesAs === 'link';
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
    const item = this.values.find(
      (value) => this.formattingFunction(value) === evt.detail.value
    );
    if (this.isDisplayAsLink) {
      this.facet.toggleSingleSelect(item);
    } else {
      this.facet.toggleSelect(item);
    }
    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'facetValue',
      value: evt.detail.value,
    };
  }

  clearSelections() {
    if (this.filterState?.range) {
      this.numericFilter.clear();
    }
    this.facet?.deselectAll();
    if (this.withInput) {
      this.resetValidityParameters();

      this.allInputs.forEach((input) => {
        // @ts-ignore
        input.checkValidity();
        // @ts-ignore
        input.reportValidity();
      });
    }
    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'facetHeader',
    };
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
    const allValid = this.allInputs.reduce(
      // @ts-ignore
      (validSoFar, inputCmp) => validSoFar && inputCmp.reportValidity(),
      true
    );
    this.resetValidityParameters();

    if (!allValid) {
      return;
    }

    if (this.numberOfValues > 0) {
      this.engine.dispatch(
        this.headless
          .loadNumericFacetSetActions(this.engine)
          .deselectAllNumericFacetValues(this.facet.state.facetId)
      );
    }

    this.numericFilter.setRange({
      start: this.inputMin ? Number(this.inputMin.value) : undefined,
      end: this.inputMax ? Number(this.inputMax.value) : undefined,
    });

    this.focusShouldBeInFacet = true;
    this.focusTarget = {
      type: 'applyButton',
    };
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
        const facetValueIndex = this.values.findIndex(
          (value) => this.formattingFunction(value) === this.focusTarget.value
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
    const focusTarget = this.template.querySelector(
      '.facet__search-form lightning-button'
    );
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
