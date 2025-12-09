import {
  buildDateRange,
  DateFilterRange,
  DateRangeRequest,
} from '@coveo/headless';
import {Component, h, State, Prop, Event, EventEmitter} from '@stencil/core';
import {parseDate} from '../../../../utils/date-utils';
import {Button} from '../../../common/stencil-button';
import {AnyBindings} from '../../interface/bindings';

/**
 * @deprecated
 * Use `atomic-facet-date-input` instead. This component is meant to be used with Stencil components only.
 * Internal component made to be integrated in a TimeframeFacet.
 * @internal
 */
@Component({
  tag: 'atomic-stencil-facet-date-input',
  shadow: false,
})
export class FacetDateInput {
  @State() private start?: Date;
  @State() private end?: Date;
  private startRef!: HTMLInputElement;
  private endRef!: HTMLInputElement;

  @Prop() public bindings!: AnyBindings;
  @Prop() public rangeGetter!: () => DateFilterRange | undefined;
  @Prop() public rangeSetter!: (range: DateRangeRequest) => void;
  @Prop() public facetId!: string;
  @Prop() public label!: string;
  @Prop() public min?: string;
  @Prop() public max?: string = '9999-12-31';

  @Event({
    eventName: 'atomic/dateInputApply',
  })
  private applyInput!: EventEmitter;

  public connectedCallback() {
    const range = this.rangeGetter();
    this.start = range ? parseDate(range.start).toDate() : undefined;
    this.end = range ? parseDate(range.end).toDate() : undefined;
  }
  public componentDidUpdate() {
    if (!this.startRef.value && !this.endRef.value) {
      this.startRef.min = this.min || this.formattedDateValue('1401-01-01');
      this.endRef.max = this.max || '';
      this.startRef.max = this.max || '';
      this.endRef.min = this.min || '';
    }
  }

  private apply() {
    if (!this.startRef.validity.valid || !this.endRef.validity.valid) {
      return;
    }

    this.applyInput.emit({
      start: this.start,
      end: this.end,
    });

    const rangeRequest = buildDateRange({
      start: this.start!,
      end: this.end!.setHours(23, 59, 59, 999),
    });

    this.rangeSetter(rangeRequest);
  }

  private formattedDateValue(date?: string | Date) {
    if (!date) {
      return '';
    }
    return parseDate(date).format('YYYY-MM-DD');
  }

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

    const range = this.rangeGetter();

    return (
      <form
        class="mt-4 grid grid-cols-[min-content_1fr] gap-2 px-2"
        onSubmit={(e) => {
          e.preventDefault();
          this.apply();
          return false;
        }}
      >
        <label
          part="input-label"
          class={labelClasses}
          htmlFor={`${this.facetId}_start`}
        >
          {startLabel}:
        </label>
        <input
          id={`${this.facetId}_start`}
          part="input-start"
          type="date"
          ref={(ref) => (this.startRef = ref!)}
          class={inputClasses}
          aria-label={startAria}
          placeholder={placeholder}
          pattern={pattern}
          required
          // API/Index minimum supported date
          min={this.min || this.formattedDateValue('1401-01-01')}
          max={this.end ? this.formattedDateValue(this.end) : this.max}
          value={this.formattedDateValue(range?.start)}
          onInput={(e) =>
            (this.start = parseDate(
              (e.target as HTMLInputElement).value
            ).toDate())
          }
        />
        <label
          part="input-label"
          class={labelClasses}
          htmlFor={`${this.facetId}_end`}
        >
          {endLabel}:
        </label>
        <input
          id={`${this.facetId}_end`}
          part="input-end"
          type="date"
          ref={(ref) => (this.endRef = ref!)}
          class={inputClasses}
          aria-label={endAria}
          placeholder={placeholder}
          pattern={pattern}
          required
          min={this.formattedDateValue(this.start) || this.min}
          max={this.max}
          value={this.formattedDateValue(range?.end)}
          onInput={(e) =>
            (this.end = parseDate(
              (e.target as HTMLInputElement).value
            ).toDate())
          }
        />
        <Button
          style="outline-primary"
          type="submit"
          part="input-apply-button"
          class="col-span-2 truncate p-2.5"
          ariaLabel={applyAria}
          text={apply}
        ></Button>
      </form>
    );
  }
}
