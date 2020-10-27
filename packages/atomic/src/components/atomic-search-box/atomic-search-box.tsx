import {Component, h, Prop, State, Element, Host} from '@stencil/core';
import {
  SearchBox,
  SearchBoxState,
  Unsubscribe,
  buildSearchBox,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';
import {passControllerAndStateToSlot} from '../../utils/slot-utils';

export interface AtomicSearchBoxOptions {
  numberOfSuggestions: number;
}

/**
 * @slot submit-leading - Submit button placed before the input.
 * @slot input - Input that contains the query.
 * @slot suggestions - List of suggestions placed underneath the input.
 * @slot submit - Submit button placed after the input.
 */
@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.css',
  shadow: true,
})
export class AtomicSearchBox implements AtomicSearchBoxOptions {
  @Element() host!: HTMLDivElement;
  @State() searchBoxState!: SearchBoxState;
  @Prop() numberOfSuggestions = 5;

  private engine!: Engine;
  private searchBox!: SearchBox;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.searchBox = buildSearchBox(this.engine, {
      options: {
        numberOfSuggestions: this.numberOfSuggestions,
      },
    });
    this.unsubscribe = this.searchBox.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.searchBoxState = this.searchBox.state;
  }

  public get options(): AtomicSearchBoxOptions {
    return {
      numberOfSuggestions: this.numberOfSuggestions,
    };
  }

  private onSlotchange(e: Event, slotToClear?: string) {
    passControllerAndStateToSlot(
      e,
      this.searchBox,
      this.searchBoxState,
      this.options,
      slotToClear ? [slotToClear] : undefined
    );
  }

  public render() {
    return (
      <Host>
        <slot
          name="submit-leading"
          onSlotchange={(e) => this.onSlotchange(e, 'submit')}
        ></slot>

        <slot name="input" onSlotchange={(e) => this.onSlotchange(e)}>
          <atomic-search-box-input
            controller={this.searchBox}
            state={this.searchBoxState}
            options={this.options}
          ></atomic-search-box-input>
        </slot>

        <slot name="suggestions" onSlotchange={(e) => this.onSlotchange(e)}>
          <atomic-search-box-suggestions
            controller={this.searchBox}
            state={this.searchBoxState}
          ></atomic-search-box-suggestions>
        </slot>

        <slot name="submit" onSlotchange={(e) => this.onSlotchange(e)}>
          <atomic-search-box-submit
            controller={this.searchBox}
          ></atomic-search-box-submit>
        </slot>
      </Host>
    );
  }
}
