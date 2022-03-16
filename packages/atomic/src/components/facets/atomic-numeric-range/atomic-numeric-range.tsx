import {Component, Element, Prop} from '@stencil/core';

/**
 * The `atomic-numeric-range` component defines the range of an `atomic-numeric-facet`, and therefore must be defined within an `atomic-numeric-facet` component.
 */
@Component({
  tag: 'atomic-numeric-range',
  shadow: false,
})
export class AtomicNumericRange {
  @Element() public host!: HTMLElement;

  /**
   * The non-localized label for the facet. When defined, it will appear instead of the formatted value.
   */
  @Prop({reflect: true}) public label?: string;
  /**
   * The starting value for the numeric range.
   */
  @Prop({reflect: true}) public start!: number;
  /**
   * The ending value for the numeric range.
   */
  @Prop({reflect: true}) public end!: number;
  /**
   * Specifies whether the end value should be included in the range.
   */
  @Prop({reflect: true}) public endInclusive = false;
}
