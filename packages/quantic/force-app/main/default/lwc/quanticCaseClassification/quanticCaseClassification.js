import {LightningElement, api, track, wire} from 'lwc';
import caseClassificationTitle from '@salesforce/label/c.quantic_CaseClassificationTitle';
import moreTopics from '@salesforce/label/c.quantic_MoreTopics';
import selectOption from '@salesforce/label/c.quantic_SelectOption';
import loading from '@salesforce/label/c.quantic_Loading';
import {
  getObjectInfo,
  getPicklistValuesByRecordType,
} from 'lightning/uiObjectInfoApi';
// @ts-ignore
import CASE_OBJECT from '@salesforce/schema/Case';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").CaseAssistEngine} CaseAssistEngine */
/** @typedef {import("coveo").CaseField} CaseField */

/**
 * The `QuanticCaseClassification` component displays field value suggestions returned by Coveo Case Assist as well as a single-select dropdown containing other available values retrieved from the CASE_OBJECT of the Salesforce org used.
 * Note: only supports Salesforce fields of type `Picklist`.
 *
 * @category Case Assist
 * @example
 * <c-quantic-case-classification engine-id={engineId} coveo-field-name="sfpriority" sf-field-api-name="Priority" required label="Which topic is related to your issue?" select-placeholder="More topics" max-suggestions="3" message-when-value-missing="Select an option"></c-quantic-case-classification>
 */
export default class QuanticCaseClassification extends LightningElement {
  labels = {
    caseClassificationTitle,
    moreTopics,
    selectOption,
    loading,
  };

  @wire(getObjectInfo, {objectApiName: CASE_OBJECT})
  objectInfo;
  // @ts-ignore
  @wire(getPicklistValuesByRecordType, {
    recordTypeId: '$objectInfo.data.defaultRecordTypeId',
    objectApiName: CASE_OBJECT,
  })
  setPicklistValues({data, error}) {
    if (error) {
      console.error('Error getting the picklist values');
    } else {
      if (data) {
        this.picklistValues = data;
        this.allOptionsReceived = true;
        if (!data.picklistFieldValues[this.sfFieldApiName]) {
          this.renderingError = `The Salesforce field API name "${this.sfFieldApiName}" is not found.`;
        }
      }
    }
  }

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The name of the field of the case in the Salesforce API to be classified.
   * @api
   * @type {string}
   */
  @api sfFieldApiName;
  /**
   * The name of the Coveo field to be classified.
   * @api
   * @type {string}
   */
  @api coveoFieldName;
  /**
   * Tells whether the input is required or not.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api required = false;
  /**
   * The label to be shown to the user.
   * @api
   * @type {string}
   * @defaultValue `'Which topic relates to your issue?'`
   */
  @api label = this.labels.caseClassificationTitle;
  /**
   * The placeholder of the combo box input.
   * @api
   * @type {string}
   * @defaultValue `'More Topics'`
   */
  @api selectPlaceholder = this.labels.moreTopics;
  /**
   * The maximum number of suggestions to be displayed.
   * @api
   * @type {number}
   * @defaultValue `3`
   */
  @api maxSuggestions = 3;
  /**
   * The message to be shown when the value is missing.
   * @api
   * @type {string}
   * @defaultValue `'Select an option'`
   */
  @api messageWhenValueMissing = this.labels.selectOption;

  /** @type {Array<object>} */
  @track classifications = [];
  /** @type {Array<object>} */
  previousClassifications = [];
  /** @type {Object} */
  @track picklistValues;
  /** @type {boolean} */
  loading = false;
  /** @type {CaseAssistEngine} */
  engine;
  /** @type {CaseField} */
  field;
  /** @type {Function} */
  unsubscribeField;
  /** @type {string} */
  _errorMessage = '';
  /** @type {boolean} */
  _isSelectVisible = false;
  /** @type {string} */
  _value = '';
  /** @type {boolean} */
  _isSuggestionsVisible = true;
  /** @type {string} */
  renderingError = '';
  /** @type {boolean} */
  hideSuggestions = false;
  /** @type {boolean} */
  lockedState = false;
  /** @type {boolean} */
  allOptionsReceived;
  /** @type {Object} */
  loggedInvalidFieldValueWarnings = {};

  connectedCallback() {
    this.validateProps();
    if (!this.renderingError) {
      registerComponentForInit(this, this.engineId);
    }
  }

  renderedCallback() {
    if (!this.renderingError) {
      initializeWithHeadless(this, this.engineId, this.initialize);
    }
  }

  /**
   * @param {CaseAssistEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.field = CoveoHeadlessCaseAssist.buildCaseField(engine, {
      options: {
        field: this.coveoFieldName,
      },
    });
    this.unsubscribeField = this.field.subscribe(() => this.updateFieldState());

    this.actions = {
      ...CoveoHeadlessCaseAssist.loadCaseAssistAnalyticsActions(engine),
      ...CoveoHeadlessCaseAssist.loadCaseFieldActions(engine),
    };
  };

  disconnectedCallback() {
    this.unsubscribeField?.();
  }

  validateProps() {
    if (!(Number(this.maxSuggestions) >= 0)) {
      this.renderingError = `"${this.maxSuggestions}" is an invalid maximum number of suggestions. A positive integer was expected.`;
    }
    if (!this.coveoFieldName) {
      this.renderingError = 'coveoFieldName is required, please set its value.';
    }
  }

  updateFieldState() {
    if (!this.lockedState) {
      this.loading = this.field.state.loading;
      const hasNewSuggestions =
        this.maxSuggestions > 0 && this.newSuggestionsReceived;
      const value =
        hasNewSuggestions && this.isAutoSelectionNeeded
          ? this.classifications[0].value
          : this.field.state.value;
      this.setFieldValue(value, hasNewSuggestions);
      this.updateSuggestionsVisibility();
    }
  }

  /**
   * Whether there is an error in the input.
   * @returns {boolean}
   */
  @api get hasError() {
    return !!this._errorMessage;
  }

  /**
   * Shows an error message in the component if there is an error.
   * @returns {void}
   */
  @api reportValidity() {
    if (this.required && !this._value) {
      this._errorMessage = this.messageWhenValueMissing;
    } else {
      this._errorMessage = '';
    }
  }

  /**
   * Returns the value of the case classification input.
   * @returns {string}
   */
  @api get value() {
    return this._value;
  }

  /**
   * Returns the error message to be shown.
   * @type {string}
   */
  get errorMessage() {
    return this._errorMessage;
  }

  /**
   * Tells if there are more options to show in addition to the suggested options.
   * @returns {boolean}
   */
  get isMoreOptionsVisible() {
    return this.options.length > Math.max(Number(this.maxSuggestions), 0);
  }

  /**
   * Returns a list of all the possible options.
   * @returns {Array<{value: string, label: string}>}
   */
  get options() {
    return (
      this.picklistValues?.picklistFieldValues?.[this.sfFieldApiName]?.values ??
      []
    );
  }

  /**
   * Whether the select input is visible.
   * @type {boolean}
   */
  get isSelectVisible() {
    return this._isSelectVisible || this.classifications.length <= 0;
  }

  /**
   * Whether the suggested options are visible.
   * @type{boolean}
   */
  get isSuggestionsVisible() {
    return this._isSuggestionsVisible;
  }

  /**
   * Returns the CSS class of the form.
   * @returns {string}
   */
  get formClass() {
    return `slds-form-element ${this.hasError ? 'slds-has-error' : ''}`;
  }

  /**
   * Returns the options, excluding the suggestions.
   * @returns {Array<object>}
   */
  get filteredOptions() {
    return this.options
      .filter(
        (option) =>
          !this.classifications.some((item) => item.value === option.value)
      )
      .map((option) => {
        return {...option, checked: option.value === this._value};
      });
  }

  /**
   * Returns the suggestions to display.
   * @returns {Array<object>}
   */
  get suggestions() {
    if (!this.allOptionsReceived) {
      return [];
    }
    return this.classifications
      .filter((suggestion) => {
        const suggestionIncludedInOptions = this.options.some(
          (option) => option.value === suggestion.value
        );
        if (!suggestionIncludedInOptions) {
          this.logInvalidFieldValueWarningOnce(suggestion.value);
        }
        return suggestionIncludedInOptions;
      })
      .map((suggestion) => {
        return {...suggestion, checked: suggestion.value === this._value};
      });
  }

  /**
   * Shows the select input.
   * @returns {void}
   */
  showSelect() {
    this._isSelectVisible = true;
  }

  /**
   * Hides the select input.
   * @returns {void}
   */
  hideSelect() {
    this._isSelectVisible = false;
  }

  /**
   * Handles the selection of a suggestion.
   * @returns {void}
   */
  handleSelectSuggestion(event) {
    const value = event.target.checked ? event.target.value : '';
    this.setFieldValue(value);
  }

  /**
   * Handles the select input change.
   * @returns {void}
   */
  handleSelectChange(event) {
    this.lockedState = true;
    const value = event.target.value;
    this.setFieldValue(value);
    if (this._isSuggestionsVisible && this.isMoreOptionsVisible) {
      this.animateHideSuggestions();
    }
  }

  /**
   * Hide the suggested options.
   * @returns {void}
   */
  animateHideSuggestions() {
    const suggestions = this.template.querySelectorAll(
      '.case-classification-suggestion'
    );
    suggestions.forEach((suggestion) => {
      // @ts-ignore
      suggestion.style.width = `${suggestion.clientWidth}px`;
      suggestion.classList.add('visual-picker__hidden');
    });
  }

  /**
   * Set the current value and update the state.
   * @returns {void}
   */
  setFieldValue(value, autoSelection) {
    if (this.field.state.value !== value) {
      this.field.update(value, undefined, autoSelection);
    }
    this._value = value;
    if (this._errorMessage && value) {
      this._errorMessage = '';
    }
  }

  /**
   * Indicates whether a value is one of the proposed suggestions.
   * @param {string} value
   * @returns {boolean}
   */
  isSuggestion(value) {
    return this.suggestions.some((suggestion) => suggestion.value === value);
  }

  /**
   * Indicates whether new suggestions have been received.
   * @returns {boolean}
   */
  get newSuggestionsReceived() {
    this.previousClassifications = this.classifications;
    this.classifications =
      this.field.state.suggestions.slice(
        0,
        Math.max(Number(this.maxSuggestions), 0)
      ) ?? [];
    return (
      this.classifications.length &&
      JSON.stringify(this.classifications) !==
        JSON.stringify(this.previousClassifications)
    );
  }
  /**
   * Indicates whether auto-selecting the suggestion with the highest confidence is needed.
   * @returns {boolean}
   */
  get isAutoSelectionNeeded() {
    return (
      !this.field.state.value ||
      this.previousClassifications?.[0]?.value === this.field.state.value
    );
  }

  /**
   * Logs warning message when a field receives an invalid suggestion value.
   * @returns {void}
   */
  logInvalidFieldValueWarningOnce(value) {
    if (!this.loggedInvalidFieldValueWarnings[value]) {
      this.loggedInvalidFieldValueWarnings[value] = true;
      console.warn(
        `The value "${value}" was not found among all the options retrieved from Salesforce. Ensure that the Coveo field name "${this.coveoFieldName}" corresponds to the correct Salesforce field name "${this.sfFieldApiName}".`
      );
    }
  }

  /**
   * Updates the visibility of the suggestions.
   * @returns {void}
   */
  updateSuggestionsVisibility() {
    if (
      this._value &&
      !this.isSuggestion(this._value) &&
      this.isMoreOptionsVisible
    ) {
      this.hideSuggestions = true;
      this.showSelect();
    } else {
      this.hideSuggestions = false;
      this.hideSelect();
    }
  }
}
