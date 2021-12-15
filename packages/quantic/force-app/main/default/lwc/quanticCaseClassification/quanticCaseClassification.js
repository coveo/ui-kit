import {LightningElement, api, track} from 'lwc';
import caseClassificationTitle from '@salesforce/label/c.quantic_CaseClassificationTitle';
import moreTopics from '@salesforce/label/c.quantic_MoreTopics';
import selectOption from '@salesforce/label/c.quantic_SelectOption';
import {
  registerComponentForInit,
  initializeWithHeadless,
  loadDependencies,
} from 'c/quanticHeadlessLoader';

/**
 * A section for a user to classify his case aided by suggestions provided by Coveo Case Assist. There is also a dropdown available to see all available values for a given category.
 */
export default class QuanticCaseClassification extends LightningElement {
  labels = {
    caseClassificationTitle,
    moreTopics,
    selectOption,
  };

  /**
   * The field of the case to be classified.
   */
  @api fieldName;

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  engine;
  headless;

  field;
  unsubscribeField;

  @track classifications = [];

  /**
   * All the possible values of a given category.
   * @api
   * @type {Array}
   * @defaultValue `[]`
   */
  @api options = [];

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
   * @defaultValue `'Which topic is related to your issue?'`
   */
  @api label = this.labels.caseClassificationTitle;

  /**
   * The placeholder of the combo box input.
   * @api
   * @type {string}
   * @defaultValue `'More topics'`
   */
  @api selectPlaceholder = this.labels.moreTopics;

  /**
   * The maximum number of choices to be displayed, a choice can be a suggestions, an inline option or the select dropdown.
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

  /** @type {string} */
  _errorMessage = '';

  /** @type {boolean} */
  _isSelectVisible = false;

  /** @type {string} */
  _value = '';

  /** @type {boolean} */
  _isSuggestionsVisible = true;

  /**
   * Tells if there is an error in the input.
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
   * Returns the error message to be shown.
   * @type {string}
   */
  get errorMessage() {
    return this._errorMessage;
  }

  /**
   * Tells if there is more options to show in addition to the suggested options.
   * @returns {boolean}
   */
  get isMoreOptionsVisible() {
    return this.options.length > Math.max(parseInt(this.maxChoices, 10), 1);
  }

  /**
   * Tells if the select input is visible.
   * @type {boolean}
   */
  get isSelectVisible() {
    return this._isSelectVisible || 0 >= this.suggestions.length;
  }

  /**
   * Tells if the suggested options are visible.
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
   * @returns {Array}
   *  */
  get filtredOptions() {
    return this.options.filter((option) => {
      return (
        this.classifications.findIndex(
          (item) => item.value === option.value
        ) === -1
      );
    });
  }

  /**
   * Returns the suggestions to be shown.
   * @returns {Array}
   */
  get suggestions() {
    return this.classifications.slice(
      0,
      Math.max(parseInt(this.maxChoices, 10), 1) - 1
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
   * Returns the value of the case classification input.
   * @returns {string}
   */
  @api get value() {
    return this._value;
  }

  /**
   * Hide the suggested options.
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
    loadDependencies(this, 'case-assist').then((headless) => {
      this.headless = headless;
    });
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.engine = engine;
    this.field = this.headless.buildCaseField(engine, {
      options: {
        field: this.fieldName,
      },
    });
    this.unsubscribeField = this.field.subscribe(() => this.updateFieldState());

    this.actions = {
      ...this.headless.loadCaseAssistAnalyticsActions(engine),
      ...this.headless.loadCaseFieldActions(engine),
    };
  };

  disconnectedCallback() {
    this.unsubscribeField?.();
  }

  updateFieldState() {
    this.classifications = this.field.state.suggestions ?? [];
  }
}
