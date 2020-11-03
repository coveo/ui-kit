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
 *
 * @part input - Text input
 * @part clear-btn - Clear button element.
 */
@Component({
  tag: 'atomic-search-box-input',
  styleUrl: 'atomic-search-box-input.scss',
  shadow: true,
})
export class AtomicSearchBoxInput {
  @Prop() @ParentState() state!: SearchBoxState;
  @Prop() @ParentController() controller!: SearchBox;
  @Prop() @ParentOptions() options!: AtomicSearchBoxOptions;
  @Prop() placeholder = '';

  private onInputChange(e: KeyboardEvent) {
    const value = (e.target as HTMLInputElement).value;
    this.controller.updateText(value);
  }

  private onInputBlur() {
    setTimeout(() => this.controller.hideSuggestions(), 100);
  }

  render() {
    return (
      <div class="position-relative">
        <input
          type="text"
          part="input"
          class="form-control rounded-0 rounded-left"
          placeholder={this.placeholder}
          value={this.state.value}
          onInput={(e) => this.onInputChange(e as KeyboardEvent)}
          onFocus={() => this.controller.showSuggestions()}
          onBlur={() => this.onInputBlur()}
        />
        <button
          type="button"
          aria-label="Clear"
          part="clear-btn"
          class={`btn-close px-2 py-0 h-100 position-absolute right-0 top-0 ${
            this.state.value === '' && 'd-none'
          }`}
          onClick={() => this.controller.clear()}
        >
          <slot></slot>
        </button>
      </div>
    );
  }
}
