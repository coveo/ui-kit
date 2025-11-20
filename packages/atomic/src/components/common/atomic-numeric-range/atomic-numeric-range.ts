import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {LightDomMixin} from '@/src/mixins/light-dom';

/**
 * The `atomic-numeric-range` component defines the range of an `atomic-numeric-facet`, and therefore must be defined within an `atomic-numeric-facet` component.
 */
@customElement('atomic-numeric-range')
export class AtomicNumericRange extends LightDomMixin(LitElement) {
  /**
   * The non-localized label for the facet. When defined, it will appear instead of the formatted value.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @property({reflect: true}) public label?: string;

  /**
   * The starting value for the numeric range.
   */
  @property({type: Number, reflect: true}) public start!: number;

  /**
   * The ending value for the numeric range.
   */
  @property({type: Number, reflect: true}) public end!: number;

  /**
   * Specifies whether the end value should be included in the range.
   */
  @property({type: Boolean, reflect: true}) public endInclusive = false;
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-numeric-range': AtomicNumericRange;
  }
}
