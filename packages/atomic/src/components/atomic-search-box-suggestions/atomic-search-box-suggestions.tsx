import {SearchBox, SearchBoxState} from '@coveo/headless';
import {Component, h, Prop} from '@stencil/core';
import {ParentState, ParentController} from '../../utils/slot-utils';

/**
 * @part suggestion - Suggestion button element
 * @part suggestions - Suggestions list
 */
@Component({
  tag: 'atomic-search-box-suggestions',
  styleUrl: 'atomic-search-box-suggestions.scss',
  shadow: true,
})
export class AtomicSearchBoxSuggestions {
  @Prop() @ParentState() state!: SearchBoxState;
  @Prop() @ParentController() controller!: SearchBox;

  private onClickSuggestion(e: MouseEvent) {
    const value = (e.target as HTMLElement).innerText;
    this.controller.selectSuggestion(value);
  }

  private suggestions() {
    return this.state.suggestions.map((suggestion) => (
      <button
        type="button"
        tabIndex={-1}
        class="list-group-item list-group-item-action"
        onClick={(e) => this.onClickSuggestion(e)}
        part="suggestion"
      >
        {suggestion.value}
      </button>
    ));
  }

  render() {
    return (
      <div part="suggestions" class="list-group">
        {this.suggestions()}
      </div>
    );
  }
}
