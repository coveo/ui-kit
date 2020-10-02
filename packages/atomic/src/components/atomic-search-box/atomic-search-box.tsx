import {Component, ComponentInterface, h, Prop, State} from '@stencil/core';
import {
  SearchBox,
  SearchBoxState,
  Unsubscribe,
  buildSearchBox,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.css',
  shadow: true,
})
export class AtomicSearchBox implements ComponentInterface {
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

  private onInputChange(e: KeyboardEvent) {
    const value = (e.target as HTMLInputElement).value;
    this.searchBox.updateText(value);
  }

  private onInputBlur() {
    setTimeout(() => this.searchBox.hideSuggestions(), 100);
  }

  private clear() {
    this.searchBox.clear();
  }

  private onClickSuggestion(e: MouseEvent) {
    const value = (e.target as HTMLElement).innerText;
    this.searchBox.selectSuggestion(value);
  }

  private suggestions() {
    return this.searchBoxState.suggestions.map((suggestion) => (
      <li onClick={(e) => this.onClickSuggestion(e)}>{suggestion.value}</li>
    ));
  }

  public render() {
    return (
      <div>
        <input
          value={this.searchBoxState.value}
          onInput={(e) => this.onInputChange(e as KeyboardEvent)}
          onFocus={() => this.searchBox.showSuggestions()}
          onBlur={() => this.onInputBlur()}
        />
        <button onClick={() => this.clear()}>Clear</button>
        <button onClick={() => this.searchBox.submit()}>Search</button>
        <ul>{this.suggestions()}</ul>
      </div>
    );
  }
}
