import { LightningElement, api } from 'lwc';
import writeDescriptiveTitle from '@salesforce/label/c.cookbook_WriteDescriptiveTitle';

/**
 * The `subjectInput` component is an input for the subject of the case. 
 * @example
 * <c-subject-input></c-subject-input>
 */
export default class SubjectInput extends LightningElement {
  labels = {
    writeDescriptiveTitle
  }
  /**
   * The label of the input.
   * @api
   * @type {string}
   * @defaultValue `'Write a descriptive title'`
   */
  @api label = this.labels.writeDescriptiveTitle;

  /**
   * The maximum length of the string to be written in the input.
   * @api
   * @type {number}
   * @defaultValue `100`
   */
  @api maxLength = 100;

  /** @type {string} */
  _value = '';

  /** @type {number} */
  _length = this._value.length;

  handleChange = (e) => {
    this._value = e.target.value;
    this._length = e.target.value.length;
  }

  /**
   * Returns the value of the input.
   * @api
   * @returns {string}
   */
  @api get value() {
    return this._value;
  }

  /**
   * Returns the length of the value of the input.
   * @returns {number}
   */
  get length() {
    return this._length;
  }
}