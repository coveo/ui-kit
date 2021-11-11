import { LightningElement, api } from 'lwc';
import explainProblem from '@salesforce/label/c.cookbook_ExplainProblem';

/**
  * The `descriptionInput` component is a rich text input for the description of the case.
  * @example
  * <c-description-input></c-description-input>
  */
export default class DescriptionInput extends LightningElement {
  labels = {
    explainProblem
  }

  /**
   * The label to be shown to the user.
   * @api
   * @type {string}
   * @defaultValue `'Explain the problem'`
   */
  @api label = this.labels.explainProblem;

  /** @type {string} */
  _value = '';

  /**
   * List of formats to include in the editor.
   * @api
   * @type {Array<string>}
   */
  @api formats = [
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'indent',
    'clean',
    'table',
    'header',
  ];

  handleChange(e) {
    this._value = e.target.value;
  }

  /**
   * Returns the value of the input.
   * @api
   * @returns {string}
   */
  @api get value() {
    return this._value;
  }
}