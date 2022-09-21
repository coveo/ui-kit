import {Component, h, State, Prop, Event, EventEmitter} from '@stencil/core';
import {buildDateRange} from '@coveo/headless';
import {Button} from '../../button';
import {AnyBindings} from '../../interface/bindings';
import {DateFilter, DateFilterState} from '../../types';
import {parseDate} from '../../../../utils/date-utils';

/**
 * Internal component made to be integrated in a TimeframeFacet.
 * @internal
 */
@Component({
  tag: 'atomic-facet-date-input',
  shadow: false,
})
export class FacetDateInput {
  @State() private start?: Date;
  @State() private end?: Date;
  private startRef!: HTMLInputElement;
  private endRef!: HTMLInputElement;

  @Prop() public bindings!: AnyBindings;
  @Prop() public filter!: DateFilter;
  @Prop() public filterState!: DateFilterState;
  @Prop() public label!: string;

  @Event({
    eventName: 'atomic/dateInputApply',
  })
  private applyInput!: EventEmitter;

  public connectedCallback() {
    this.start = this.filterState.range
      ? parseDate(this.filterState.range.start).toDate()
      : undefined;
    this.end = this.filterState.range
      ? parseDate(this.filterState.range.end).toDate()
      : undefined;
  }

  private apply() {
    if (!this.startRef.validity.valid || !this.endRef.validity.valid) {
      return;
    }

    this.applyInput.emit();
    this.filter.setRange(
      buildDateRange({
        start: this.start!,
        end: this.end!,
      })
    );
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

    const placeholder = 'yyyy-mm-dd';
    // Fallback for Safari < 14.1, date with format yyyy-mm-dd over 1400 (API limit)
    const pattern =
      '^(1[4-9]\\d{2}|2\\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$';

    return (
      <form
        class="grid gap-2 grid-cols-min-1fr mt-4 px-2"
        onSubmit={(e) => {
          e.preventDefault();
          this.apply();
          return false;
        }}
      >
        <label
          part="input-label"
          class={labelClasses}
          htmlFor={`${this.filterState.facetId}_start`}
        >
          {startLabel}:
        </label>
        <input
          id={`${this.filterState.facetId}_start`}
          part="input-start"
          type="date"
          ref={(ref) => (this.startRef = ref!)}
          class={inputClasses}
          aria-label={startAria}
          placeholder={placeholder}
          pattern={pattern}
          required
          // API/Index minimum supported date
          min={this.formattedDateValue('1401-01-01')}
          max={this.formattedDateValue(this.end)}
          value={this.formattedDateValue(this.filterState.range?.start)}
          onInput={(e) =>
            (this.start = parseDate(
              (e.target as HTMLInputElement).value
            ).toDate())
          }
        />
        <label
          part="input-label"
          class={labelClasses}
          htmlFor={`${this.filterState.facetId}_end`}
        >
          {endLabel}:
        </label>
        <input
          id={`${this.filterState.facetId}_end`}
          part="input-end"
          type="date"
          ref={(ref) => (this.endRef = ref!)}
          class={inputClasses}
          aria-label={endAria}
          placeholder={placeholder}
          pattern={pattern}
          required
          min={this.formattedDateValue(this.start)}
          value={this.formattedDateValue(this.filterState.range?.end)}
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
          class="p-2.5 col-span-2 truncate"
          ariaLabel={applyAria}
          text={apply}
        ></Button>
      </form>
    );
  }
}
