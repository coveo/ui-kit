import {isUndefined} from '@coveo/bueno';
import type {NumericFacet} from '@coveo/headless/commerce';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

export type Range = {start: number; end: number};

/**
 * Internal component made to be integrated in a NumericFacet.
 * @internal
 */
@customElement('atomic-commerce-facet-number-input')
@bindings()
export class AtomicCommerceFacetNumberInput
  extends LightDomMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  /**
   * The bindings object containing i18n and engine context for the component.
   */
  @state()
  bindings!: CommerceBindings;

  @state()
  error!: Error;

  /**
   * The label for the numeric facet input, used for accessibility and display.
   */
  @property({type: String}) public label!: string;
  /**
   * The numeric range to pre-populate the input fields, if any.
   */
  @property({type: Object}) public range?: Range;
  /**
   * The NumericFacet controller instance from Headless.
   */
  @property({type: Object}) public facet!: NumericFacet;

  @state() private start?: number;
  @state() private end?: number;

  private startRef?: HTMLInputElement;
  private endRef?: HTMLInputElement;

  static styles = css`[part="input-form"] {
    display: grid;
    grid-template-areas:
      "label-start label-end ."
      "input-start input-end apply-button";
    grid-template-columns: 1fr 1fr auto;
  }
  
  [part="label-start"] {
    grid-area: label-start;
  }
  [part="label-end"] {
    grid-area: label-end;
  }
  [part="input-start"] {
    grid-area: input-start;
  }
  [part="input-end"] {
    grid-area: input-end;
  }
  
  [part="input-apply-button"] {
    grid-area: apply-button;
  }
  `;

  initialize() {
    this.start = this.range?.start;
    this.end = this.range?.end;
  }

  private apply() {
    if (!this.startRef?.validity.valid || !this.endRef?.validity.valid) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('atomic-number-input-apply', {
        detail: {
          start: this.start,
          end: this.end,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private get absoluteMinimum(): number {
    const {field} = this.facet.state;
    const isPriceField = ['ec_price', 'ec_promo_price'].includes(field);
    return isPriceField ? 0 : Number.MIN_SAFE_INTEGER;
  }

  private get minimumInputValue(): number {
    return isUndefined(this.start) ? this.absoluteMinimum : this.start!;
  }

  private get maximumInputValue() {
    return isUndefined(this.end) ? Number.MAX_SAFE_INTEGER : this.end!;
  }

  private get startValue() {
    return this.range?.start !== undefined ? String(this.range.start) : '';
  }

  private get endValue() {
    return this.range?.end !== undefined ? String(this.range.end) : '';
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const {facetId} = this.facet.state;
    const label = this.bindings.i18n.t(this.label);
    const minText = this.bindings.i18n.t('min');
    const maxText = this.bindings.i18n.t('max');
    const minAria = this.bindings.i18n.t('number-input-minimum', {label});
    const maxAria = this.bindings.i18n.t('number-input-maximum', {label});
    const apply = this.bindings.i18n.t('apply');
    const applyAria = this.bindings.i18n.t('number-input-apply', {label});
    const inputClasses =
      'p-2.5 input-primary placeholder-neutral-dark min-w-0 mr-1';
    const labelClasses = 'text-neutral-dark text-sm';
    const step = 'any';
    return html`
      <form
        class="mt-4 gap-y-0.5 px-2"
        part="input-form"
        @submit=${(e: Event) => {
          e.preventDefault();
          this.apply();
          return false;
        }}
      >
        <label part="label-start" class=${labelClasses} for="${facetId}_start">
          ${minText}
        </label>
        <input
          part="input-start"
          id="${facetId}_start"
          type="number"
          step=${step as unknown as number}
          .value=${this.startValue}
          class=${inputClasses}
          aria-label=${minAria}
          required
          min=${this.absoluteMinimum}
          max=${this.maximumInputValue}
          @input=${(e: Event) => {
            this.start = (e.target as HTMLInputElement).valueAsNumber;
          }}
          ${ref((ref) => {
            this.startRef = ref as HTMLInputElement;
          })}
        />
        <label part="label-end" class=${labelClasses} for="${facetId}_end">
          ${maxText}
        </label>
        <input
          part="input-end"
          id="${facetId}_end"
          type="number"
          step=${step as unknown as number}
          .value=${this.endValue}
          class=${inputClasses}
          aria-label=${maxAria}
          required
          min=${this.minimumInputValue}
          max=${Number.MAX_SAFE_INTEGER}
          @input=${(e: Event) => {
            this.end = (e.target as HTMLInputElement).valueAsNumber;
          }}
          ${ref((ref) => {
            this.endRef = ref as HTMLInputElement;
          })}
        />
        <button
          style="outline-primary"
          type="submit"
          part="input-apply-button"
          class="flex-none truncate p-2.5"
          aria-label=${applyAria}
        >
          ${apply}
        </button>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-facet-number-input': AtomicCommerceFacetNumberInput;
  }
}
