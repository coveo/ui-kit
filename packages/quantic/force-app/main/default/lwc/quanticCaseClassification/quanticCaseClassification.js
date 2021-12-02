import { LightningElement, api } from 'lwc';
import caseClassificationTitle from '@salesforce/label/c.quantic_CaseClassificationTitle';
import selectTopic from '@salesforce/label/c.quantic_SelectTopic';
import moreTopics from '@salesforce/label/c.quantic_MoreTopics';
import selectOption from '@salesforce/label/c.quantic_SelectOption';

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
   * All the options proposed to the user to choose from.
   * @type {Array}
   * @defaultValue `[]`
   */
  @api options = [];

  /**
   * The number of suggestions to be shown.
   * @type {number}
   * @defaultValue `3`
   */
  @api numberOfSuggestions = 3;

  /**
   * Tells if the case classification input is required.
   * @type {boolean}
   * @defaultValue `false`
   */
  @api required = false;

  /**
   * The label to be shown to the user.
   * @type {string}
   * @defaultValue `'Which product is related to your problem?'`
   */
  @api label = this.labels.caseClassificationTitle;

  /**
   * The placeholder of the combo box input. 
   * @type {string}
   * @defaultValue `'Select Product'`
   */
  @api slectPlaceholder = this.labels.selectTopic;

  /**
   * The title of the button to show the combo box button.
   * @type {string}
   * @defaultValue `'Select another feature'`
   */
  @api selectTitle = this.labels.moreTopics;

  /**
   * The message to be shown when the value is missing.
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
    return this.options.length > this.numberOfSuggestions;
  }

  /**
   * Returns the suggested options to be shown as the suggestions provided by Coveo case assist.
   * @returns {Array}
   */
  get suggestedOptions() {
    if (0 > parseInt(this.numberOfSuggestions, 10)) {
      console.warn('numberOfSuggestions should be greater or equal to 0');
      return [];
    }
    return this.options.slice(0, this.numberOfSuggestions);
  }

  /**
   * Tells if the select input is visible.
   * @type {boolean}
   */
  get isSelectVisible() {
    return (
      this._isSelectVisible || 0 >= parseInt(this.numberOfSuggestions, 10)
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
}
