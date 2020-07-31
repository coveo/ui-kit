import {Component, ComponentInterface, h, Prop, State} from '@stencil/core';
import {
  SearchBox,
  SearchBoxState,
  Unsubscribe,
  buildSearchBox,
} from '@coveo/headless';
import {headlessEngine} from '../../engine';
import {Schema, NumberValue} from '@coveo/bueno';

@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.css',
  shadow: true,
})
export class AtomicSearchBox implements ComponentInterface {
  @Prop() isStandalone = false;

  @Prop() numberOfSuggestions = 5;

  @Prop() superfluousProp = 5;

  @State() searchBoxState!: SearchBoxState;

  private error?: Error;
  private searchBox!: SearchBox;
  private unsubscribe?: Unsubscribe;

  constructor() {
    try {
      this.searchBox = buildSearchBox(headlessEngine, {options: this.options});
      this.validateProps();
    } catch (error) {
      this.error = error;
      return;
    }

    this.unsubscribe = this.searchBox.subscribe(() => this.updateState());
  }

  private validateProps() {
    new Schema({
      superfluousProp: new NumberValue({min: 0, max: 10}),
    }).validate({superfluousProp: this.superfluousProp});
  }

  public componentShouldUpdate(
    newState: SearchBoxState,
    oldState: SearchBoxState
  ) {
    // Stencil re-renders whenever the state is updated, checking for state changes prevent rerenders
    return JSON.stringify(newState) !== JSON.stringify(oldState);
  }

  public componentDidUpdate() {
    if (this.searchBoxState.redirectTo) {
      window.location.assign(this.searchBoxState.redirectTo);
    }
  }

  public disconnectedCallback() {
    this.unsubscribe && this.unsubscribe();
  }

  private get options() {
    return {
      isStandalone: this.isStandalone,
      numberOfSuggestions: this.numberOfSuggestions,
    };
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
    if (this.error) {
      return (
        <p>
          {this.error.name}
          <br />
          {this.error.message}
        </p>
      );
    }

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
