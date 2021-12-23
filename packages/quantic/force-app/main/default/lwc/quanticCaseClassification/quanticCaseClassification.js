import {LightningElement, api, track, wire} from 'lwc';
import caseClassificationTitle from '@salesforce/label/c.quantic_CaseClassificationTitle';
import moreTopics from '@salesforce/label/c.quantic_MoreTopics';
import selectOption from '@salesforce/label/c.quantic_SelectOption';
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
 * The `QuanticCaseClassification` component displays field value suggestion returned by Coveo Case Assist as well as a single-select dropdown containing other available values.
 *
 * @category Case Assist
 * @example
 * <c-quantic-case-classification engine-id={engineId} field-name="Priority" required label="Which topic is related to your issue?" select-placeholder="More topics" max-choices="4" message-when-value-missing="Select an option"></c-quantic-case-classification>
 */
export default class QuanticCaseClassification extends LightningElement {
  @wire(getObjectInfo, {objectApiName: CASE_OBJECT})
  objectInfo;

  // @ts-ignore
  @wire(getPicklistValuesByRecordType, {
    recordTypeId: '$objectInfo.data.defaultRecordTypeId',
    objectApiName: CASE_OBJECT,
  })
  picklistValues;

  labels = {
    caseClassificationTitle,
    moreTopics,
    selectOption,
  };

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  /**
   * The field of the case to be classified.
   */
  @api fieldName;

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
   * The maximum number of choices to be displayed, a choice can be a suggestion, an inline option or the select dropdown.
   * @api
   * @type {number}
   * @defaultValue `4`
   */
  @api maxChoices = 4;

  /**
   * The message to be shown when the value is missing.
   * @api
   * @type {string}
   * @defaultValue `'Select an option'`
   */
  @api messageWhenValueMissing = this.labels.selectOption;

  /** @type {Array<object>} */
  @track classifications = [];

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

  /**
   * Whether there is an error in the input.
   * @returns {boolean}
   */
  @api get hasError() {
    return !!this._errorMessage;
  }

  get options() {
    return (
      this.picklistValues?.data?.picklistFieldValues?.[this.fieldName]
        ?.values ?? []
    );
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
    return this.options.length > Math.max(Number(this.maxChoices), 1);
  }

  /**
   * Whether the select input is visible.
   * @type {boolean}
   */
  get isSelectVisible() {
    return this._isSelectVisible || 0 >= this.suggestions.length;
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
    return this.options.filter(
      (option) =>
        !this.classifications.some((item) => item.value === option.value)
    );
  }

  /**
   * Returns the suggestions to be shown.
   * @returns {Array}
   */
  get suggestions() {
    return this.classifications.slice(
      0,
      Math.max(Number(this.maxChoices), 1) - 1
    );
  }

  /**
   * Shows the select input.
   * @returns {void}
   */
  showSelect() {
    this._isSelectVisible = true;
  }

  /**
   * Handles the selection of a suggestion.
   * @returns {void}
   */
  handleSelectClassification(event) {
    const suggestionId = event.target.dataset.suggestionId;
    const value = event.target.value;
    this.engine.dispatch(this.actions.logClassificationClick(suggestionId));
    this.field.update(value);
    this._errorMessage = '';
    this._value = value;
  }

  /**
   * Handles the select input change.
   * @returns {void}
   */
  handleSelectChange(event) {
    const value = event.target.value;
    this.field.update(value);
    this._errorMessage = '';
    this._value = value;
    if (this._isSuggestionsVisible && this.isMoreOptionsVisible) {
      this._hideSuggestions();
    }
  }

  /**
   * Hide the suggested options.
   * @returns {void}
   */
  _hideSuggestions() {
    const suggestions = this.template.querySelectorAll('.slds-visual-picker');
    suggestions.forEach((suggestion) => {
      // @ts-ignore
      suggestion.style.width = `${suggestion.clientWidth}px`;
      suggestion.classList.add('visual-picker__hidden');
    });
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {CaseAssistEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.field = CoveoHeadlessCaseAssist.buildCaseField(engine, {
      options: {
        field: `sf${this.fieldName.toLowerCase()}`,
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

  updateFieldState() {
    this.classifications = this.field.state.suggestions ?? [];
    this.loading = this.field.state.loading;
  }
}
