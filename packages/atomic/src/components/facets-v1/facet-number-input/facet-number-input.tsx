import {
  Component,
  h,
  State,
  Prop,
  Host,
  Watch,
  Event,
  EventEmitter,
} from '@stencil/core';
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
  @State() private start = '';
  @State() private end = '';

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
    this.updateState();
  }

  @Watch('filterState')
  private updateState() {
    if (this.filterState.isLoading) {
      return;
    }

    this.start = this.filterState.range?.start.toString() || '';
    this.end = this.filterState.range?.end.toString() || '';
  }

  private apply() {
    this.applyInput.emit();
    this.filter.setRange({
      start: parseFloat(this.start),
      end: parseFloat(this.end),
    });
  }

  private validateInput(value: string) {
    if (this.type === 'decimal') {
      return value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    }

    return value.replace(/(?!^-)[^0-9]/g, '');
  }

  private get inputErrorMessage() {
    if (this.start === '') {
      return this.bindings.i18n.t('inputValueMissing', {
        value: this.bindings.i18n.t('min'),
      });
    }

    if (this.end === '') {
      return this.bindings.i18n.t('inputValueMissing', {
        value: this.bindings.i18n.t('max'),
      });
    }

    const start = parseFloat(this.start);
    if (isNaN(start)) {
      return this.bindings.i18n.t('inputValueInvalid', {
        value: this.bindings.i18n.t('min'),
      });
    }

    const end = parseFloat(this.end);
    if (isNaN(end)) {
      return this.bindings.i18n.t('inputValueInvalid', {
        value: this.bindings.i18n.t('max'),
      });
    }

    if (end < start) {
      return this.bindings.i18n.t('maxValueTooLow');
    }

    return null;
  }

  render() {
    const label = this.bindings.i18n.t(this.label);
    const min = this.bindings.i18n.t('min');
    const minAria = this.bindings.i18n.t('numberInputMinimum', {label});
    const max = this.bindings.i18n.t('max');
    const maxAria = this.bindings.i18n.t('numberInputMaximum', {label});
    const apply = this.bindings.i18n.t('apply');
    const applyTitle = this.inputErrorMessage
      ? this.inputErrorMessage
      : this.bindings.i18n.t('numberInputApply', {label});

    const commonClasses = 'text-base rounded p-2.5 border border-neutral-light';
    const inputClasses = `${commonClasses} placeholder-neutral-dark min-w-0 mr-1`;

    return (
      <Host class="flex flex-col mt-4">
        <div class="inline-flex">
          <input
            part="input-start"
            class={inputClasses}
            placeholder={min}
            aria-label={minAria}
            value={this.start}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.value = this.start = this.validateInput(target.value);
            }}
          />
          <input
            part="input-end"
            class={inputClasses}
            placeholder={max}
            aria-label={maxAria}
            value={this.end}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.value = this.end = this.validateInput(target.value);
            }}
          />
          <button
            part="input-apply-button"
            class={`${commonClasses} bg-background text-primary disabled:cursor-not-allowed disabled:bg-neutral disabled:text-neutral-dark flex-none`}
            title={applyTitle}
            onClick={() => this.apply()}
            disabled={!!this.inputErrorMessage}
          >
            {apply}
          </button>
        </div>
      </Host>
    );
  }
}
