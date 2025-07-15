import {AnyBindings} from '@/src/components';
import {renderButton} from '@/src/components/common/button';
import {errorGuard} from '@/src/decorators/error-guard';
import {injectStylesForNoShadowDOM} from '@/src/decorators/light-dom';
import type {LitElementWithError} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {parseDate} from '@/src/utils/date-utils';
import {
  buildDateRange,
  type DateFilterRange,
  type DateRangeRequest,
} from '@coveo/headless';
import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {createRef, ref, type Ref} from 'lit/directives/ref.js';
import styles from './atomic-facet-date-input.tw.css';

/**
 * Internal component made to be integrated in a TimeframeFacet.
 * @internal
 */
@customElement('atomic-facet-date-input')
@injectStylesForNoShadowDOM // TODO: check if can be removed
@withTailwindStyles // TODO: check if can be removed
export class AtomicFacetDateInput
  extends LitElement
  implements LitElementWithError
{
  static styles = unsafeCSS(styles);

  @state() private start?: Date;
  @state() private end?: Date;
  private startRef: Ref<HTMLInputElement> = createRef();
  private endRef: Ref<HTMLInputElement> = createRef();

  @property({type: Object}) public bindings!: AnyBindings;
  @property({type: Object}) public rangeGetter!: () =>
    | DateFilterRange
    | undefined;
  @property({type: Object}) public rangeSetter!: (
    range: DateRangeRequest
  ) => void;
  @property() public facetId!: string;
  @property() public label!: string;
  @property() public min?: string;
  @property() public max?: string;

  @state() error!: Error;

  connectedCallback() {
    super.connectedCallback();
    this.validateParentComponent();
    const range = this.rangeGetter();
    this.start = range ? parseDate(range.start).toDate() : undefined;
    this.end = range ? parseDate(range.end).toDate() : undefined;
  }

  /**
   * Validates that this component is only used within an atomic-commerce-timeframe-facet.
   * This is an internal component and should not be used directly by consumers.
   */
  private validateParentComponent(): void {
    const validParents = [
      'atomic-commerce-timeframe-facet',
      'atomic-timeframe-facet', // TODO: check that the non commerce date facet works as well
    ];
    const parentElement = this.parentElement;

    const shadowHost =
      this.getRootNode() instanceof ShadowRoot
        ? (this.getRootNode() as ShadowRoot).host
        : null;

    const hostElements = [parentElement, shadowHost].filter(
      Boolean
    ) as Element[];

    const isValidParent = hostElements.some(({tagName}) =>
      validParents.includes(tagName.toLowerCase())
    );

    if (!isValidParent) {
      const error = new Error(
        'atomic-facet-date-input is an internal component and should only be used within <atomic-commerce-timeframe-facet>.'
      );
      this.error = error;
    }
  }

  updated(_changedProperties: Map<string, unknown>) {
    super.updated(_changedProperties);
    const startInput = this.startRef.value;
    const endInput = this.endRef.value;

    if (startInput && endInput && !startInput.value && !endInput.value) {
      startInput.min = this.min || this.formattedDateValue('1401-01-01');
      endInput.max = this.max || '';
      startInput.max = this.max || '';
      endInput.min = this.min || '';
    }
  }

  private apply() {
    const startInput = this.startRef.value;
    const endInput = this.endRef.value;

    if (!startInput?.validity.valid || !endInput?.validity.valid) {
      return;
    }

    const eventDict = {
      detail: {
        start: this.start,
        end: this.end,
      },
      bubbles: true,
    };

    this.dispatchEvent(new CustomEvent('atomic-date-input-apply', eventDict));

    // Backwards compatibility for stencil components listening this event
    this.dispatchEvent(new CustomEvent('atomic/dateInputApply', eventDict));

    const rangeRequest = buildDateRange({
      start: this.start!,
      end: new Date(this.end!.getTime()).setHours(23, 59, 59, 999),
    });

    this.rangeSetter(rangeRequest);
  }

  private formattedDateValue(date?: string | Date) {
    if (!date) {
      return '';
    }
    return parseDate(date).format('YYYY-MM-DD');
  }

  @errorGuard()
  render() {
    const label = this.bindings.i18n.t(this.label);
    const startLabel = this.bindings.i18n.t('start');
    const endLabel = this.bindings.i18n.t('end');
    const startAria = this.bindings.i18n.t('date-input-start', {label});
    const endAria = this.bindings.i18n.t('date-input-end', {label});
    const apply = this.bindings.i18n.t('apply');
    const applyAria = this.bindings.i18n.t('date-input-apply', {label});

    const inputClasses = 'input-primary p-2.5';
    const labelClasses = 'text-neutral-dark self-center';

    const placeholder = 'yyyy-mm-dd';
    // Fallback for Safari < 14.1, date with format yyyy-mm-dd over 1400 (API limit)
    const pattern =
      '^(1[4-9]\\d{2}|2\\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$';

    const range = this.rangeGetter();

    return html`
      <form
        class="mt-4 grid grid-cols-[min-content_1fr] gap-2 px-2"
        @submit=${(e: Event) => {
          e.preventDefault();
          this.apply();
          return false;
        }}
      >
        <label
          part="input-label"
          class=${labelClasses}
          for=${`${this.facetId}_start`}
        >
          ${startLabel}:
        </label>
        <input
          id=${`${this.facetId}_start`}
          part="input-start"
          type="date"
          ${ref(this.startRef)}
          class=${inputClasses}
          aria-label=${startAria}
          placeholder=${placeholder}
          pattern=${pattern}
          required
          min=${ifDefined(this.min || this.formattedDateValue('1401-01-01'))}
          max=${ifDefined(
            this.end ? this.formattedDateValue(this.end) : this.max
          )}
          .value=${this.formattedDateValue(range?.start)}
          @input=${(e: Event) => {
            this.start = parseDate(
              (e.target as HTMLInputElement).value
            ).toDate();
          }}
        />
        <label
          part="input-label"
          class=${labelClasses}
          for=${`${this.facetId}_end`}
        >
          ${endLabel}:
        </label>
        <input
          id=${`${this.facetId}_end`}
          part="input-end"
          type="date"
          ${ref(this.endRef)}
          class=${inputClasses}
          aria-label=${endAria}
          placeholder=${placeholder}
          pattern=${pattern}
          required
          min=${ifDefined(this.formattedDateValue(this.start) || this.min)}
          max=${ifDefined(this.max)}
          .value=${this.formattedDateValue(range?.end)}
          @input=${(e: Event) => {
            this.end = parseDate((e.target as HTMLInputElement).value).toDate();
          }}
        />
        ${renderButton({
          props: {
            style: 'outline-primary',
            type: 'submit',
            part: 'input-apply-button',
            class: 'col-span-2 truncate p-2.5',
            ariaLabel: applyAria,
            text: apply,
          },
        })(html``)}
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-facet-date-input': AtomicFacetDateInput;
  }
}
