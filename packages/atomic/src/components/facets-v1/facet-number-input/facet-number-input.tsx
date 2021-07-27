import {Component, h, State, Prop, Event, EventEmitter} from '@stencil/core';
import {NumericFilter, NumericFilterState} from '@coveo/headless';
import {Bindings} from '../../../utils/initialization-utils';
import {NumberInputType} from './number-input-type';

/**
 * Internal component made to be integrated in a NumericFacet.
 * @internal
 */
@Component({
  tag: 'atomic-facet-number-input',
  shadow: false,
})
export class FacetNumberInput {
  @State() private start?: number;
  @State() private end?: number;
  private startRef!: HTMLInputElement;
  private endRef!: HTMLInputElement;

  @Prop() public bindings!: Bindings;
  @Prop() public type!: NumberInputType;
  @Prop() public filter!: NumericFilter;
  @Prop() public filterState!: NumericFilterState;
  @Prop() public label!: string;

  @Event({
    eventName: 'atomic/numberInputApply',
  })
  private applyInput!: EventEmitter;

  public connectedCallback() {
    this.start = this.filterState.range?.start;
    this.end = this.filterState.range?.end;
  }

  private apply() {
    if (!this.startRef.validity.valid || !this.endRef.validity.valid) {
      return;
    }

    this.applyInput.emit();
    this.filter.setRange({
      start: this.start!,
      end: this.end!,
    });
  }

  render() {
    const label = this.bindings.i18n.t(this.label);
    const minPlaceholder = this.bindings.i18n.t('min');
    const minAria = this.bindings.i18n.t('number-input-minimum', {label});
    const maxPlaceholder = this.bindings.i18n.t('max');
    const maxAria = this.bindings.i18n.t('number-input-maximum', {label});
    const apply = this.bindings.i18n.t('apply');
    const applyAria = this.bindings.i18n.t('number-input-apply', {label});

    const commonClasses = 'rounded p-2.5 border border-neutral';
    const inputClasses = `${commonClasses} placeholder-neutral-dark min-w-0 mr-1`;

    const step = this.type === 'integer' ? '1' : 'any';

    return (
      <form
        class="flex flex-row mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          this.apply();
          return false;
        }}
      >
        <input
          part="input-start"
          type="number"
          step={step}
          ref={(ref) => (this.startRef = ref!)}
          class={inputClasses}
          placeholder={minPlaceholder}
          aria-label={minAria}
          required
          min={Number.MIN_SAFE_INTEGER}
          max={this.end}
          value={this.filterState.range?.start}
          onInput={(e) =>
            (this.start = (e.target as HTMLInputElement).valueAsNumber)
          }
        />
        <input
          part="input-end"
          type="number"
          step={step}
          ref={(ref) => (this.endRef = ref!)}
          class={inputClasses}
          placeholder={maxPlaceholder}
          aria-label={maxAria}
          required
          min={this.start}
          max={Number.MAX_SAFE_INTEGER}
          value={this.filterState.range?.end}
          onInput={(e) =>
            (this.end = (e.target as HTMLInputElement).valueAsNumber)
          }
        />
        <button
          type="submit"
          part="input-apply-button"
          class={`${commonClasses} bg-background text-primary flex-none`}
          aria-label={applyAria}
        >
          {apply}
        </button>
      </form>
    );
  }
}
