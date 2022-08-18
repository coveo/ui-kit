import {LightningElement, api} from 'lwc';
import {RGBToHSL, HEXToRGB, invalidRGBValues} from './colorsUtils';

const defaultPrimaryColor = '#FFF7BA';
const defaultSecondaryColor = '#E2B104';
const lightnessDegree = 48;

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
   * The primary color of the badge.
   * @api
   * @type {string}
   */
  @api color;

  /** @type{boolean} */
  invalidColor = false;

  renderedCallback() {
    if (this.label) {
      this.setBadgeColors();
    }
  }

  /**
   * Sets the primary and scondary colors to be used in the colored badge.
   * @returns {void}
   */
  setBadgeColors() {
    // @ts-ignore
    const styles = this.template.querySelector('.result-badge')?.style;
    const secondaryColor = this.generateSecondaryColor(lightnessDegree);
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
   * Generates the secondary color.
   * @param {number} lightnessAmount the amount of lightness with which to update the primary color.
   * @returns {string}
   */
  generateSecondaryColor(lightnessAmount) {
    const {r, g, b} = HEXToRGB(this.color);

    if (invalidRGBValues(r, g, b)) {
      this.invalidColor = true;
      return defaultSecondaryColor;
    }

    const HSLColor = RGBToHSL(r, g, b);
    const {h, s} = HSLColor;
    let l = HSLColor.l;

    if (l >= 50) {
      l -= lightnessAmount;
    } else {
      l += lightnessAmount;
    }

    return `hsl(${h}, ${s}%, ${l.toFixed(1)}%)`;
  }
}
