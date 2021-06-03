import {Component, Element, Prop} from '@stencil/core';

/**
 * The `atomic-date-range` component defines the range of an `atomic-date-facet`, and therefore must be defined within an `atomic-date-facet` component.
 */
@Component({
  tag: 'atomic-date-range',
  shadow: false,
})
export class AtomicDateRange {
  @Element() public host!: HTMLElement;

  /**
   * The starting date for the range.
   * It can be expressed as a Javascript date, as a number using epoch time or as a string using the ISO 8601 format.
   */
  @Prop() public start!: Date | string | number;

  /**
   * The ending date for the range.
   * It can be expressed as a Javascript date, as a number using epoch time or as a string using the ISO 8601 format.
   */
  @Prop() public end!: Date | string | number;

  connectedCallback() {
    this.validateStart();
    this.validateEnd();
  }

  validateStart() {
    if (!this.start) {
      this.throwMissingDateRangeError('start');
    }
  }

  validateEnd() {
    if (!this.end) {
      this.throwMissingDateRangeError('end');
    }
  }

  throwMissingDateRangeError(option: 'start' | 'end') {
    throw new Error(
      `The <atomic-date-range> has no ${option} date. Please specify the "${option}" attribute.`
    );
  }
}
