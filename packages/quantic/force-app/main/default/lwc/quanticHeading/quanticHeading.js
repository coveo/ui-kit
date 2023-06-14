import {LightningElement, api} from 'lwc';

export default class QuanticHeading extends LightningElement {
  /**
   * The label dsiplayed inside the heading.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The level to use for the heading label, accepted values are integers from 1 to 6.
   * A value outside of the range of 1 to 6 will render a div instead of a heading.
   * @type {number}
   */
  @api level;

  renderedCallback() {
    const heading = this.template.querySelector('div');
    const headingTag =
      this.level > 0 && this.level <= 6 ? `h${this.level}` : 'div';
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    heading.innerHTML = `<${headingTag}>${this.label}</h${headingTag}`;
  }
}
