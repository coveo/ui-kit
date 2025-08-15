import {getBueno} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';
import {HEXToRGB, invalidRGBValues, validHEXColor} from './colorsUtils';

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
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.Result.html) to use. Will be ignored if label is provided.
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

  /** @type {string} */
  error;
  validated = false;

  connectedCallback() {
    getBueno(this).then(() => {
      if (
        (!this.label || !Bueno.isString(this.label)) &&
        (!this.result || !this.field || !Bueno.isString(this.field))
      ) {
        console.error(
          `The ${this.template.host.localName} requires a label or result and a field to be specified.`
        );
        this.setError();
      }
      if (this.color && !validHEXColor(this.color)) {
        console.error(`The "${this.color}" color is not a valid HEX color.`);
        this.setError();
      }
      if (!this.color) {
        console.warn(
          'The color property has not been specified, the default colors will be used.'
        );
      }
      this.validated = true;
    });
  }

  setError() {
    this.error = `${this.template.host.localName} Error`;
  }

  /**
   * Whether the field value can be displayed.
   * @returns {boolean}
   */
  get isValid() {
    return this.validated && !this.error;
  }

  renderedCallback() {
    // eslint-disable-next-line no-unused-expressions
    this.isValid && this.hasTextToDisplay && this.setBadgeColors();
  }

  get hasTextToDisplay() {
    return !!(this.label || this.result?.raw?.[this.field]);
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
    if (!this.color) {
      this.invalidColor = true;
      return defaultSecondaryColor;
    }

    const {r, g, b} = HEXToRGB(this.color);

    if (invalidRGBValues(r, g, b)) {
      this.invalidColor = true;
      return defaultSecondaryColor;
    }

    const luminance =
      (r / 255.0) * 0.2126 + (g / 255.0) * 0.7152 + (b / 255.0) * 0.0722;

    return luminance >= 0.5 ? 'black' : 'white';
  }
}
