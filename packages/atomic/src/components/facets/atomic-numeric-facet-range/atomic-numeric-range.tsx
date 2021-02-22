import {Component, Element, Prop} from '@stencil/core';

/**
 * Component that defines a numeric facet range.
 * Has to be used inside an `atomic-numeric-facet` component.
 */
@Component({
  tag: 'atomic-numeric-range',
  shadow: false,
})
export class AtomicNumericRange {
  @Element() public host!: HTMLElement;

  /**
   * The starting value for the numeric range
   */
  @Prop() public start!: number;
  /**
   * The ending value for the numeric range
   */
  @Prop() public end!: number;
  /**
   * Specifies whether or not the end value should be included in the range
   */
  @Prop() public endInclusive = false;
}
