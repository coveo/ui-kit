import {Component, Element, Prop, Watch} from '@stencil/core';

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

  @Watch('start')
  validateStart() {
    if (!this.start) {
      throw new Error('The start date has not been set.');
    }
  }

  /**
   * The ending date for the range.
   * It can be expressed as a Javascript date, as a number using epoch time or as a string using the ISO 8601 format.
   */
  @Prop() public end!: Date | string | number;

  @Watch('end')
  validateEnd() {
    if (!this.end) {
      throw new Error('The end date has not been set.');
    }
  }
}
