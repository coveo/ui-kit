import {LightningElement, api} from 'lwc';

/**
 * The `QuanticHeading` component offers the ability to display a label with a customizable heading level.
 * @category Utility
 * @example
 * <c-quantic-heading label="My label" level="1"></c-quantic-heading>
 */
export default class QuanticHeading extends LightningElement {
  /**
   * The label displayed inside the heading.
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
    const heading = this.template.querySelector('[data-section="label"]');
    // @ts-ignore
    const level = parseInt(this.level, 10);
    const headingTag = level > 0 && level <= 6 ? `h${level}` : 'div';
    const tag = document.createElement(headingTag);
    if (this.label) {
      tag.innerText = this.label;
    }
    heading.appendChild(tag);
  }
}
