import { LightningElement, api } from 'lwc';

/**
 * A section for a user to classify his case aided by suggestions provided by Coveo Case Assist. There is also a dropdown available to see all available values for a given category. 
 */
export default class CaseClassification extends LightningElement {

  /**
   * All the options proposed to the user to choose from.
   * @type {Array}
   * @defaultValue `[]`
   */
  @api options = [
    { id: 0, label: 'Heart rate tracking', value: 'Heart rate tracking' },
    { id: 1, label: 'Run tracking', value: 'Run tracking' },
    { id: 2, label: 'Health Metrics', value: 'Health Metrics' },
    { id: 3, label: 'Blue series', value: 'Blue series' },
    { id: 4, label: 'Gold series', value: 'Gold Series' },
  ];

  /**
   * The number of suggestions to be shown.
   * @type {number}
   * @defaultValue `3`
   */
  @api numberOfSuggestions = 3;

  /**
   * The label to be shown to the user.
   * @type {string}
   * @defaultValue `'Which product is related to your problem?'`
   */
  @api label = 'Which product is related to your problem?';

  /**
   * @type {string}
   * @defaultValue `'Select Product'`
   */
  @api slectPlaceHolder = 'Select Product';

  /**
   * @type {string}
   * @defaultValue `'Select another feature'`
   */
  @api selectTitle = 'Select another feature';

  /**
   * Returns the suggested options to be shown as the suggestions provided by Coveo case assist.
   * @returns {Array}
   */
  get suggestedOptions() {
    return this.options.slice(0, this.numberOfSuggestions);
  }

  /**
   * Tells if the select input is visible
   * @type {boolean}
   */
  get isSelectVisible() {
    return this._isSelectVisible || this.numberOfSuggestions === 0;
  }

  /**
   * Tells if the suggested options are visible.
   * @type{boolean}
   */
  get isSuggestionsVisible() {
    return this._isSuggestionsVisible;
  }

  /** @type {boolean} */
  _isSelectVisible = false;

  /** @type {string} */
  _Value = '';

  /** @type {boolean} */
  _isSuggestionsVisible = true;

  /**
   * Shows the select input.
   * @returns {void}
   */
  showSelect() {
    this._isSelectVisible = true;
  }

  /** 
   * Handles the input change.
   * @returns {void} 
   */
  handleSelectChange(event) {
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
    this._value = event.target.value;
  }

  /**
   * Hide the suggested options.
   */
  _hideSuggestions() {
    const suggestions = this.template.querySelectorAll('.slds-visual-picker')
    suggestions.forEach(suggestion => {
      // @ts-ignore
      suggestion.style.width = `${suggestion.clientWidth}px`;
      suggestion.classList.add('visual-picker__hidden');
    });
  }
}