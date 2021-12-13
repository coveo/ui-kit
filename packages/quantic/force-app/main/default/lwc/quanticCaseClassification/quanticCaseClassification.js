import { LightningElement, api, track} from 'lwc';
import caseClassificationTitle from '@salesforce/label/c.quantic_CaseClassificationTitle';
import selectTopic from '@salesforce/label/c.quantic_SelectTopic';
import moreTopics from '@salesforce/label/c.quantic_MoreTopics';
import selectOption from '@salesforce/label/c.quantic_SelectOption';
import {registerComponentForInit, initializeWithHeadless, loadDependencies} from 'c/quanticHeadlessLoader';

/**
 * A section for a user to classify his case aided by suggestions provided by Coveo Case Assist. There is also a dropdown available to see all available values for a given category.
 */
export default class QuanticCaseClassification extends LightningElement {
  labels = {
    caseClassificationTitle,
    moreTopics,
    selectTopic,
    selectOption
  };

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  headless;

  priority;
  unsubscribePriority;

  @track classifications = [];

  /**
   * The options proposed to the user to choose from.
   * @type {Array}
   * @defaultValue `[]`
   */
  @api options = [];

  /**
   * Tells if the case classification input is required.
   * @type {boolean}
   * @defaultValue `false`
   */
  @api required = false;

  /**
   * The label to be shown to the user.
   * @type {string}
   * @defaultValue `'Which topic is related to your issue?'`
   */
  @api label = this.labels.caseClassificationTitle;

  /**
   * The placeholder of the combo box input. 
   * @type {string}
   * @defaultValue `'More topics'`
   */
  @api selectPlaceholder = this.labels.moreTopics;

  /**
   * The number of suggestions to be shown.
   * @type {number}
   * @defaultValue `3`
   */
  @api numberOfSuggestions = 3;

  /**
   * The message to be shown when the value is missing.
   * @type {string}
   * @defaultValue `'Select an option'`
   */
  @api messageWhenValueMissing = this.labels.selectOption;

  /**
   * The max options to be displayed. an option can be a suggestion or the select dropdown.
   * @type {number}
   * @defaultValue `4`
   */
  @api maxOptions = 4

  /** @type {string} */
  _errorMessage = '';

  /** @type {boolean} */
  _isSelectVisible = false;

  /** @type {string} */
  _value = '';

  /** @type {boolean} */
  _isSuggestionsVisible = true;

  @track _options = []

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
    return this.options.length + this.suggestions.length > this.maxOptions;
  }

  /**
   * Tells if the select input is visible.
   * @type {boolean}
   */
  get isSelectVisible() {
    return (
      this._isSelectVisible || 0 >= this.classifications.length
    );
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
   * Returns all the options, including the suggestions.
   * @returns {Array}
   *  */
  get allOptions(){
    return [...this.options, ...this.suggestions]
  }
  
  /**
   * Returns the suggestions to be shown.
   * @returns {Array}
   */
  get suggestions(){
    const suggestionsToOptions = this.classifications.map(option=>{
      return {value: option.value, label: option.value}
    })
    return suggestionsToOptions.slice(0, this.numberOfSuggestions)
  }

  /**
   * Shows the select input.
   * @returns {void}
   */
  showSelect() {
    this._isSelectVisible = true;
  }

  /**
   * Handles the select input change.
   * @returns {void}
   */
  handleSelectChange(event) {
    this._errorMessage = '';
    if (this._isSuggestionsVisible) {
      this._hideSuggestions();
    }
    this._value = event.target.value;
  }

  /**
   * Handles changes in the suggested options.
   * @returns {void}
   */
  handleChange(event) {
    this._errorMessage = '';
    this._value = event.target.value;
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
      this.headless = headless
    })
    registerComponentForInit(this, this.engineId);
    this._options = this.options
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    // this._options = this.options

  }

  initialize = (engine) => {
    this.priority = this.headless.buildCaseField(engine, {
      options: {
        field: 'sfpriority'
      }
    });
    this.unsubscribePriority = this.priority.subscribe(() => this.updatePriorityState());
  }
  
  disconnectedCallback() {
    this.unsubscribePriority?.();
  }
  
  updatePriorityState() {
    this.classifications = this.priority.state.suggestions ?? [];
    const suggestToOpptions = this.classifications.map(option=>{
      return {value: option.value, label: option.value}
    })
    console.log(suggestToOpptions)
    this._options = [...this.options, ...suggestToOpptions]
    console.log(JSON.parse(JSON.stringify(this._options)))
  }
}
