import {
  buildDateRange,
  type DateFilterRange,
  type DateRangeRequest,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {renderButton} from '@/src/components/common/button';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {parseDate} from '@/src/utils/date-utils';
import type {AnyBindings} from '../interface/bindings';

export type FacetDateInputEventDetails = Omit<DateRangeRequest, 'state'>;

/**
 * Internal component made to be integrated in a TimeframeFacet.
 *
 * @event atomic-date-input-apply: FacetDateInputEventDetails - Fired when the user applies a date range selection.
 * The event detail contains the date range with start and end dates.
 *
 * @internal
 */
@customElement('atomic-facet-date-input')
@bindings()
export class AtomicFacetDateInput
  extends LightDomMixin(LitElement)
  implements LitElementWithError
{
  @state() private start?: Date;
  @state() private end?: Date;
  private startRef: Ref<HTMLInputElement> = createRef();
  private endRef: Ref<HTMLInputElement> = createRef();

  initialize() {}

  @property({type: Object}) public inputRange: DateFilterRange | undefined;
  @property() public facetId!: string;
  @property() public label!: string;
  @property() public min?: string;
  @property() public max?: string = '9999-12-31';

  @state() error!: Error;

  @state() bindings!: AnyBindings;

  connectedCallback() {
    super.connectedCallback();
    this.validateParentComponent();

    this.start = this.inputRange
      ? parseDate(this.inputRange.start).toDate()
      : undefined;
    this.end = this.inputRange
      ? parseDate(this.inputRange.end).toDate()
      : undefined;
  }

  /**
   * Validates that this component is only used within an atomic-commerce-timeframe-facet.
   * This is an internal component and should not be used directly by consumers.
   */
  private validateParentComponent(): void {
    const validParents = [
      'atomic-commerce-timeframe-facet',
      'atomic-timeframe-facet',
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
        'atomic-facet-date-input is an internal component and should only be used within a timeframe facet.'
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

    const rangeRequest = buildDateRange({
      start: this.start!,
      end: new Date(this.end!.getTime()).setHours(23, 59, 59, 999),
    });

    const eventDict = {
      detail: {
        start: rangeRequest.start,
        end: rangeRequest.end,
        endInclusive: rangeRequest.endInclusive,
      },
      bubbles: true,
    };

    this.dispatchEvent(
      new CustomEvent<FacetDateInputEventDetails>(
        'atomic-date-input-apply',
        eventDict
      )
    );

    // Backwards compatibility for stencil components listening this event
    this.dispatchEvent(new CustomEvent('atomic/dateInputApply', eventDict));
  }

  private formattedDateValue(date?: string | Date) {
    if (!date) {
      return '';
    }
    return parseDate(date).format('YYYY-MM-DD');
  }

  @bindingGuard()
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

    const placeholder = this.bindings.i18n.t('date-format-placeholder');
    // Fallback for Safari < 14.1, date with format yyyy-mm-dd over 1400 (API limit)
    const pattern =
      '^(1[4-9]\\d{2}|2\\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$';

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
          .value=${this.formattedDateValue(this.inputRange?.start)}
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
          .value=${this.formattedDateValue(this.inputRange?.end)}
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
