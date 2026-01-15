import type {NumericFilter, NumericFilterState} from '@coveo/headless';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {renderButton} from '@/src/components/common/button';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import type {NumberInputType} from '../facets/facet-number-input/number-input-type';
import type {AnyBindings} from '../interface/bindings';

/**
 * Internal component made to be integrated in a NumericFacet.
 * @internal
 */
@customElement('atomic-facet-number-input')
@bindings()
export class AtomicFacetNumberInput
  extends LightDomMixin(LitElement)
  implements InitializableComponent<AnyBindings>
{
  /**
   * The type of number input (integer or decimal).
   */
  @property({type: String}) public type!: NumberInputType;
  /**
   * The label for the numeric facet input, used for accessibility and display.
   */
  @property({type: String}) public label!: string;
  /**
   * The NumericFilter controller instance from Headless.
   */
  @property({type: Object}) public filter!: NumericFilter;
  /**
   * The NumericFilterState from the filter controller.
   */
  @property({type: Object, attribute: 'filter-state'})
  public filterState!: NumericFilterState;

  @state()
  bindings!: AnyBindings;
  @state()
  error!: Error;
  @state() private start?: number;
  @state() private end?: number;

  private startRef: Ref<HTMLInputElement> = createRef();
  private endRef: Ref<HTMLInputElement> = createRef();

  static styles = css`
    [part='input-form'] {
      display: grid;
      grid-template-areas:
        'label-start label-end .'
        'input-start input-end apply-button';
      grid-template-columns: 1fr 1fr auto;
    }

    [part='label-start'] {
      grid-area: label-start;
    }
    [part='label-end'] {
      grid-area: label-end;
    }
    [part='input-start'] {
      grid-area: input-start;
    }
    [part='input-end'] {
      grid-area: input-end;
    }

    [part='input-apply-button'] {
      grid-area: apply-button;
    }
  `;

  public initialize() {
    this.start = this.filterState?.range?.start;
    this.end = this.filterState?.range?.end;
  }

  @bindingGuard()
  @errorGuard()
  render() {
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

    const step = this.type === 'integer' ? '1' : 'any';

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
        <label
          part="label-start"
          class=${labelClasses}
          for="${this.filterState.facetId}_start"
        >
          ${minText}
        </label>
        <input
          part="input-start"
          id="${this.filterState.facetId}_start"
          type="number"
          step=${step as unknown as number}
          .value=${this.startValue}
          class=${inputClasses}
          aria-label=${minAria}
          required
          min=${Number.MIN_SAFE_INTEGER}
          max=${this.end ?? Number.MAX_SAFE_INTEGER}
          @input=${(e: Event) => {
            this.start = (e.target as HTMLInputElement).valueAsNumber;
          }}
          ${ref(this.startRef)}
        />
        <label
          part="label-end"
          class=${labelClasses}
          for="${this.filterState.facetId}_end"
        >
          ${maxText}
        </label>
        <input
          part="input-end"
          id="${this.filterState.facetId}_end"
          type="number"
          step=${step as unknown as number}
          .value=${this.endValue}
          class=${inputClasses}
          aria-label=${maxAria}
          required
          min=${this.start ?? Number.MIN_SAFE_INTEGER}
          max=${Number.MAX_SAFE_INTEGER}
          @input=${(e: Event) => {
            this.end = (e.target as HTMLInputElement).valueAsNumber;
          }}
          ${ref(this.endRef)}
        />
        ${renderButton({
          props: {
            style: 'outline-primary',
            type: 'submit',
            part: 'input-apply-button',
            class: 'flex-none truncate p-2.5',
            ariaLabel: applyAria,
            text: apply,
          },
        })(html``)}
      </form>
    `;
  }

  private apply() {
    if (
      !this.startRef.value?.validity.valid ||
      !this.endRef.value?.validity.valid
    ) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('atomic/numberInputApply', {
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );
    this.filter.setRange({
      start: this.start!,
      end: this.end!,
    });
  }

  private get startValue() {
    return this.filterState.range?.start !== undefined
      ? String(this.filterState.range.start)
      : '';
  }

  private get endValue() {
    return this.filterState.range?.end !== undefined
      ? String(this.filterState.range.end)
      : '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-facet-number-input': AtomicFacetNumberInput;
  }
}
