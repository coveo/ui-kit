import {NumericFacet, NumericFacetState} from '@coveo/headless/commerce';
import {Component, h, Prop, Event, EventEmitter, State} from '@stencil/core';
import {AnyBindings, NumberInputType} from '../../../../components';
import {Button} from '../../../common/button';

export type Range = {start: number; end: number}; // TODO: remove!

/**
 * Internal component made to be integrated in a NumericFacet.
 * @internal
 */
@Component({
  // TODO: remove commerce from name and use old name
  tag: 'atomic-commerce-facet-number-input',
  styleUrl: 'atomic-commerce-facet-number-input.pcss',
  shadow: false,
})
export class FacetNumberInput {
  @State() private start?: number;
  @State() private end?: number;

  private startRef!: HTMLInputElement;
  private endRef!: HTMLInputElement;

  @Prop() domainMin: number = Number.MIN_SAFE_INTEGER;
  @Prop() domainMax: number = Number.MAX_SAFE_INTEGER;
  @Prop() public bindings!: AnyBindings;
  @Prop() public type!: NumberInputType;
  @Prop() public facet!: NumericFacet;
  @Prop() public state!: NumericFacetState; // TODO: support other controller types (as long there is facetId and ({min, max}) domain)
  @Prop() public label!: string;

  // @Prop() public range?: Range;
  @Prop() public applyRangeCallback!: (start: number, end: number) => void;

  @Event({
    eventName: 'atomic/numberInputApply',
  })
  private applyInput!: EventEmitter;

  // public connectedCallback() {
  //   this.start = this.domainMin;
  //   this.end = this.domainMax;
  // }

  private apply() {
    if (!this.startRef.validity.valid || !this.endRef.validity.valid) {
      return;
    }

    this.applyInput.emit({
      start: this.start,
      end: this.end,
    });
    this.applyRangeCallback(this.start!, this.end!);
  }

  render() {
    const {facetId} = this.state;
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

    return (
      <form
        class="mt-4 px-2 gap-y-0.5"
        part="input-form"
        onSubmit={(e) => {
          e.preventDefault();
          this.apply();
          return false;
        }}
      >
        <label
          part="label-start"
          class={labelClasses}
          htmlFor={`${facetId}_start`}
        >
          {minText}
        </label>
        <input
          part="input-start"
          id={`${facetId}_start`}
          type="number"
          step={step}
          ref={(ref) => (this.startRef = ref!)}
          class={inputClasses}
          aria-label={minAria}
          required
          min={this.domainMin}
          max={this.end}
          value={this.start}
          onInput={(e) =>
            (this.start = (e.target as HTMLInputElement).valueAsNumber)
          }
        />
        <label part="label-end" class={labelClasses} htmlFor={`${facetId}_end`}>
          {maxText}
        </label>
        <input
          part="input-end"
          id={`${facetId}_end`}
          type="number"
          step={step}
          ref={(ref) => (this.endRef = ref!)}
          class={inputClasses}
          aria-label={maxAria}
          required
          min={this.start}
          max={this.domainMax}
          value={this.end}
          onInput={(e) =>
            (this.end = (e.target as HTMLInputElement).valueAsNumber)
          }
        />
        <Button
          style="outline-primary"
          type="submit"
          part="input-apply-button"
          class="p-2.5 flex-none truncate"
          ariaLabel={applyAria}
          text={apply}
        ></Button>
      </form>
    );
  }
}
