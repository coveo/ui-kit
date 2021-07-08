import {Component, h, State, Prop, Host, Watch} from '@stencil/core';
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
  @State() private isRangeInvalid = false;
  @State() private start = '';
  @State() private end = '';

  @Prop() public bindings!: Bindings;
  @Prop() public type!: NumberInputType;
  @Prop() public onApply?: () => void;
  @Prop() public filter!: NumericFilter;
  @Prop() public filterState!: NumericFilterState;
  @Prop() public label!: string;

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
    this.onApply && this.onApply();

    try {
      this.filter.setRange({
        start: parseFloat(this.start),
        end: parseFloat(this.end),
      });
      this.isRangeInvalid = false;
    } catch (error) {
      this.bindings.engine.logger.error(error);
      this.isRangeInvalid = true;
    }
  }

  private get applyEnabled() {
    const start = parseFloat(this.start);
    const end = parseFloat(this.end);
    return !isNaN(start) && !isNaN(end) && end >= start;
  }

  private validateInput(value: string) {
    if (this.type === 'decimal') {
      return value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    }

    return value.replace(/(?!^-)[^0-9]/g, '');
  }

  render() {
    const label = this.bindings.i18n.t(this.label);
    const apply = this.bindings.i18n.t('apply');
    const applyAria = this.bindings.i18n.t('numberInputApply', {label});
    const min = this.bindings.i18n.t('min');
    const minAria = this.bindings.i18n.t('numberInputMinimum', {label});
    const max = this.bindings.i18n.t('max');
    const maxAria = this.bindings.i18n.t('numberInputMaximum', {label});
    const rangeIsInvalid = this.bindings.i18n.t('rangeIsInvalid');

    const commonClasses = 'text-base rounded p-2.5 border border-neutral-light';
    const inputClasses = `${commonClasses} placeholder-neutral-dark min-w-0 mr-1`;

    return (
      <Host class="flex flex-col mt-4">
        <div class="inline-flex">
          <input
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
            class={`${commonClasses} bg-background text-primary disabled:cursor-not-allowed disabled:bg-neutral disabled:text-neutral-dark flex-none`}
            aria-label={applyAria}
            onClick={() => this.apply()}
            disabled={!this.applyEnabled}
          >
            {apply}
          </button>
        </div>
        {this.isRangeInvalid && (
          <div class="text-error mt-1 text-xs">{rangeIsInvalid}</div>
        )}
      </Host>
    );
  }
}
