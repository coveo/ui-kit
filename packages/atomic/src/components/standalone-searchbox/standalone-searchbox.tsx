import {Component, State, h} from '@stencil/core';
import {Searchbox, SearchboxState} from '@coveo/headless';
import {headlessEngine} from '../../engine';

@Component({
  tag: 'standalone-searchbox',
  shadow: true,
})
export class StandaloneSearchbox {
  @State() searchboxState!: SearchboxState;
  private searchbox!: Searchbox;

  componentWillLoad() {
    this.searchbox = new Searchbox(headlessEngine, {isStandalone: true});

    this.updateState();
    this.searchbox.subscribe(() => this.updateState());
  }

  componentShouldUpdate(newState: SearchboxState, oldState: SearchboxState) {
    // Stencil re-renders whenever the state is updated, checking for state changes prevent rerenders
    return JSON.stringify(newState) !== JSON.stringify(oldState);
  }

  componentDidUpdate() {
    if (this.searchboxState.redirectTo) {
      window.location.assign(this.searchboxState.redirectTo);
    }
  }

  private updateState() {
    this.searchboxState = this.searchbox.state;
  }

  private onInputChange(e: KeyboardEvent) {
    const value = (e.target as HTMLInputElement).value;
    this.searchbox.updateText({value});
  }

  private onInputBlur() {
    setTimeout(() => this.searchbox.hideSuggestions(), 100)
  }

  private clear() {
    this.searchbox.clear();
  }

  private onClickSuggestion(e: MouseEvent) {
    const value = (e.target as HTMLElement).innerText;
    this.searchbox.selectSuggestion({value});
  }

  suggestions() {
    return this.searchboxState.suggestions.map(suggestion => (
      <li onClick={e => this.onClickSuggestion(e)}>{suggestion.value}</li>
    ));
  }

  render() {
    return (
      <div>
        <input
          value={this.searchboxState.value}
          onInput={e => this.onInputChange(e as KeyboardEvent)}
          onFocus={() => this.searchbox.showSuggestions()}
          onBlur={() => this.onInputBlur()}
        />
        <button onClick={() => this.clear()}>Clear</button>
        <button onClick={() => this.searchbox.submit()}>Search</button>
        <ul>{this.suggestions()}</ul>
      </div>
    );
  }
}
