import {SearchBox, SearchBoxState} from '@coveo/headless';
import {Component, h, Prop} from '@stencil/core';
import {ParentState, ParentController} from '../../utils/slot-utils';

@Component({
  tag: 'atomic-search-box-suggestions',
  styleUrl: 'atomic-search-box-suggestions.css',
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
      <li onClick={(e) => this.onClickSuggestion(e)}>{suggestion.value}</li>
    ));
  }

  render() {
    return <ul>{this.suggestions()}</ul>;
  }
}
