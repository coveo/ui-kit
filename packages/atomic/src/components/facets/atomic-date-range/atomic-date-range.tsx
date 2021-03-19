import {Component, Element, Prop} from '@stencil/core';
import dayjs from 'dayjs';

/**
 * Component that defines a date facet range.
 * Has to be used inside an `atomic-date-facet` component.
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
  /**
   * Specifies whether or not the end date should be included in the range.
   */
  @Prop() public endInclusive = false;

  public componentWillLoad() {
    if (dayjs(this.start).isAfter(dayjs(this.end))) {
      console.error(
        `Start of date range is after end for ${this.start} to ${this.end}`
      );
    }
  }
}
