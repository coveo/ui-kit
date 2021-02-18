import {Component, Element, Prop} from '@stencil/core';

/**
 * Component that defines a numeric facet range.
 * Has to be used inside an `atomic-numeric-facet` component.
 */
@Component({
  tag: 'atomic-numeric-facet-range',
  shadow: false,
})
export class AtomicNumericFacetRange {
  @Element() host!: HTMLElement;

  /**
   * The starting value for the numeric range
   */
  @Prop() start!: number;
  /**
   * The ending value for the numeric range
   */
  @Prop() end!: number;
  /**
   * Specifies whether or not the end value should be included in the range
   */
  @Prop() endInclusive = false;
}
