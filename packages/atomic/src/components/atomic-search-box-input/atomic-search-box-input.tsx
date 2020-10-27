import {SearchBox, SearchBoxState} from '@coveo/headless';
import {Component, h, Prop} from '@stencil/core';
import {
  ParentController,
  ParentState,
  ParentOptions,
} from '../../utils/slot-utils';
import {AtomicSearchBoxOptions} from '../atomic-search-box/atomic-search-box';

/**
 * @slot - Content is placed inside the clear button element.
 */
@Component({
  tag: 'atomic-search-box-input',
  styleUrl: 'atomic-search-box-input.css',
  shadow: true,
})
export class AtomicSearchBoxInput {
  @Prop() @ParentState() state!: SearchBoxState;
  @Prop() @ParentController() controller!: SearchBox;
  @Prop() @ParentOptions() options!: AtomicSearchBoxOptions;
  @Prop() placeholder = 'Search';

  private onInputChange(e: KeyboardEvent) {
    const value = (e.target as HTMLInputElement).value;
    this.controller.updateText(value);
  }

  private onInputBlur() {
    setTimeout(() => this.controller.hideSuggestions(), 100);
  }

  render() {
    return [
      <input
        placeholder={this.placeholder}
        value={this.state.value}
        onInput={(e) => this.onInputChange(e as KeyboardEvent)}
        onFocus={() => this.controller.showSuggestions()}
        onBlur={() => this.onInputBlur()}
      />,
      <button onClick={() => this.controller.clear()}>
        <slot>X</slot>
      </button>,
    ];
  }
}
