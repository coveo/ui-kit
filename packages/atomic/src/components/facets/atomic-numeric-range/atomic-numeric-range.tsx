import {Component, Element, Prop} from '@stencil/core';

/**
 * The `atomic-numeric-range` component defines the range of an `atomic-numeric-facet`,
 * and therefore must be used inside an `atomic-numeric-facet` component.
 */
@Component({
  tag: 'atomic-numeric-range',
  shadow: false,
})
export class AtomicNumericRange {
  @Element() public host!: HTMLElement;

  /**
   * The starting value for the numeric range.
   */
  @Prop() public start!: number;
  /**
   * The ending value for the numeric range.
   */
  @Prop() public end!: number;
  /**
   * Specifies whether or not the end value should be included in the range.
   */
  @Prop() public endInclusive = false;
}
