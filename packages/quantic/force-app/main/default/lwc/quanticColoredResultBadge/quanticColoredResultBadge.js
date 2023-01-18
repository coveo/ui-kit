import {LightningElement, api} from 'lwc';
import {HEXToRGB, invalidRGBValues} from './colorsUtils';

const defaultPrimaryColor = '#FFF7BA';
const defaultSecondaryColor = 'black';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticColoredResultBadge` component displays a colored badge showing a label.
 * @category Result Template
 * @example
 * <c-quantic-colored-result-badge label="Case"></c-quantic-colored-result-badge>
 */
export default class QuanticColoredResultBadge extends LightningElement {
  /**
   * The label to display.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/search/controllers/result-list/#result) to use. Will be ignored if label is provided.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The field name whose values you want to display. Will be ignored if label is provided.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * The field type whose values you want to display. Will be ignored if label is provided.
   * @type { 'string' | 'date' | 'number' | 'multi'}
   */
  @api type;
  /**
   * The primary color of the badge.
   * @api
   * @type {string}
   */
  @api color;

  /** @type{boolean} */
  invalidColor = false;

  renderedCallback() {
    // eslint-disable-next-line no-unused-expressions
    this.hasTextToDisplay && this.setBadgeColors();
  }

  /**
   * get the text content to display depending the provided props.
   * @returns {string}
   */
  get textToDisplay() {
    return this.label || this.result?.raw?.[this.field]?.toString()
  }

  get hasTextToDisplay() {
    return !!this.textToDisplay;
  }

  get hasLabel() {
    return !!this.label;
  }

  /**
   * Sets the primary and secondary colors to be used in the colored badge.
   * @returns {void}
   */
  setBadgeColors() {
    // @ts-ignore
    const styles = this.template.querySelector('.result-badge')?.style;
    const secondaryColor = this.generateSecondaryColor();
    styles.setProperty(
      '--primaryColor',
      this.invalidColor ? defaultPrimaryColor : this.color
    );
    styles.setProperty(
      '--secondaryColor',
      this.invalidColor ? defaultSecondaryColor : secondaryColor
    );
  }

  /**
   * Generates the secondary color. Based on the Builder backend algo.
   * @returns {string}
   */
  generateSecondaryColor() {
    const {r, g, b} = HEXToRGB(this.color);

    if (invalidRGBValues(r, g, b)) {
      this.invalidColor = true;
      return defaultSecondaryColor;
    }

    const luminance =
      (r / 255.0) * 0.2126 +
      (g / 255.0) * 0.7152 +
      (b / 255.0) * 0.0722

    return luminance >= 0.50 ? 'black' : 'white'
  }
}
