import {Component, h, State, Prop, Event, EventEmitter} from '@stencil/core';
import {DateFilter, DateFilterState, buildDateRange} from '@coveo/headless';
import {Bindings} from '../../../utils/initialization-utils';
import dayjs from 'dayjs';
import {Button} from '../../common/button';

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

  @Prop() public bindings!: Bindings;
  @Prop() public filter!: DateFilter;
  @Prop() public filterState!: DateFilterState;
  @Prop() public label!: string;

  @Event({
    eventName: 'atomic/dateInputApply',
  })
  private applyInput!: EventEmitter;

  public connectedCallback() {
    this.start = this.filterState.range
      ? dayjs(this.filterState.range.start).toDate()
      : undefined;
    this.end = this.filterState.range
      ? dayjs(this.filterState.range.end).toDate()
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
    return dayjs(date).format('YYYY-MM-DD');
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
          required
          max={this.formattedDateValue(this.end)}
          value={this.formattedDateValue(this.filterState.range?.start)}
          onInput={(e) =>
            (this.start = (e.target as HTMLInputElement).valueAsDate!)
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
          required
          min={this.formattedDateValue(this.start)}
          value={this.formattedDateValue(this.filterState.range?.end)}
          onInput={(e) =>
            (this.end = (e.target as HTMLInputElement).valueAsDate!)
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
