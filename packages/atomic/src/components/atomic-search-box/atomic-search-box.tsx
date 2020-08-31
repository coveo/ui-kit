import {Component, ComponentInterface, h, Prop, State} from '@stencil/core';
import {
  SearchBox,
  SearchBoxState,
  Unsubscribe,
  buildSearchBox,
  Engine,
} from '@coveo/headless';
import {EngineProvider, EngineProviderError} from '../../utils/engine-utils';
import {RenderError} from '../../utils/render-utils';

@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.css',
  shadow: true,
})
export class AtomicSearchBox implements ComponentInterface {
  @State() searchBoxState!: SearchBoxState;
  @Prop() isStandalone = false;
  @Prop() numberOfSuggestions = 5;
  @EngineProvider() engine!: Engine;
  @RenderError() error?: Error;

  private searchBox!: SearchBox;
  private unsubscribe?: Unsubscribe;

  public componentWillLoad() {
    try {
      this.configure();
    } catch (error) {
      this.error = error;
    }
  }

  private configure() {
    if (!this.engine) {
      throw new EngineProviderError('atomic-search-box');
    }

    this.searchBox = buildSearchBox(this.engine, {
      options: {
        isStandalone: this.isStandalone,
        numberOfSuggestions: this.numberOfSuggestions,
      },
    });
    this.unsubscribe = this.searchBox.subscribe(() => this.updateState());
  }

  public componentDidUpdate() {
    if (this.searchBoxState.redirectTo) {
      window.location.assign(this.searchBoxState.redirectTo);
    }
  }

  public disconnectedCallback() {
    this.unsubscribe && this.unsubscribe();
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
