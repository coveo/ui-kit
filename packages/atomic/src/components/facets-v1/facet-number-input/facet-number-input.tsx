import {Component, h, State, Prop, Host} from '@stencil/core';
import {
  NumericFilter,
  NumericFilterState,
  loadNumericFacetSetActions,
} from '@coveo/headless';
import {Bindings} from '../../../utils/initialization-utils';

/**
 * Internal component made to be integrated in a NumericFacet.
 * @internal
 */
@Component({
  tag: 'atomic-facet-number-input',
  shadow: false,
})
export class FacetNumberInput {
  private startRef!: HTMLInputElement;
  private endRef!: HTMLInputElement;

  @State() private isRangeInvalid = false;
  @State() private applyEnabled = false;

  @Prop() public bindings!: Bindings;
  @Prop() public facetId!: string;
  @Prop() public filter!: NumericFilter;
  @Prop() public filterState!: NumericFilterState;
  @Prop() public label!: string;

  private onApply() {
    this.bindings.engine.dispatch(
      loadNumericFacetSetActions(
        this.bindings.engine
      ).deselectAllNumericFacetValues(this.facetId)
    );

    try {
      this.filter.setRange({
        start: this.startRef.valueAsNumber,
        end: this.endRef.valueAsNumber,
      });
      this.isRangeInvalid = false;
    } catch (error) {
      this.bindings.engine.logger.error(error);
      this.isRangeInvalid = true;
    }
  }

  private enableApply() {
    const start = this.startRef.valueAsNumber;
    const end = this.endRef.valueAsNumber;

    this.applyEnabled =
      !isNaN(start) && !isNaN(end) && start >= 0 && end >= start;
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
            type="number"
            value={this.filterState.range?.start}
            ref={(ref) => (this.startRef = ref!)}
            onInput={() => this.enableApply()}
          />
          <input
            class={inputClasses}
            placeholder={max}
            aria-label={maxAria}
            type="number"
            value={this.filterState.range?.end}
            ref={(ref) => (this.endRef = ref!)}
            onInput={() => this.enableApply()}
          />
          <button
            class={`${commonClasses} bg-background text-primary disabled:bg-neutral disabled:text-neutral-dark flex-none`}
            aria-label={applyAria}
            onClick={() => this.onApply()}
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
