import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import {Component, h, State} from '@stencil/core';
import {SearchBox, SearchBoxState, buildSearchBox} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {Button} from '../common/button';

/**
 * The `atomic-search-box` component creates a search box with built-in support for suggestions.
 */
@Component({
  tag: 'atomic-search-box-v1', // TODO: remove v1
  styleUrl: 'atomic-search-box.pcss',
  shadow: true,
})
export class AtomicSearchBox {
  @InitializeBindings() public bindings!: Bindings;

  private searchBox!: SearchBox;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState;
  @State() public error!: Error;
  @State() hasFocus = false;

  public initialize() {
    this.searchBox = buildSearchBox(this.bindings.engine, {
      options: {
        numberOfSuggestions: 8, // TODO: handle when adding query suggestion component
        highlightOptions: {
          notMatchDelimiters: {
            open: '<span class="font-bold">',
            close: '</span>',
          },
          correctionDelimiters: {
            open: '<span class="font-normal">',
            close: '</span>',
          },
        },
      },
    });
  }

  private renderInputContainer() {
    return (
      <div class="flex-grow flex items-center">
        <input
          placeholder="Search..."
          type="text"
          value={this.searchBoxState.value}
          onFocus={() => (this.hasFocus = true)}
          onBlur={() => (this.hasFocus = false)}
          onInput={(e) =>
            this.searchBox.updateText((e.target as HTMLInputElement).value)
          }
        />
        {this.searchBoxState.isLoading && <span class="loading"></span>}
        {!this.searchBoxState.isLoading &&
          this.searchBoxState.value.trim() !== '' && (
            <Button
              style="text-transparent"
              part="clear-button"
              class="clear-button"
              onClick={() => this.searchBox.clear()}
            >
              <atomic-icon icon={ClearIcon} class="w-3 h-3"></atomic-icon>
            </Button>
          )}
      </div>
    );
  }

  // TODO: adapt for atomic-query-suggestions & atomic-recent-queries
  private renderSuggestions() {
    if (!this.searchBoxState.suggestions.length) {
      return;
    }

    if (!this.hasFocus) {
      return;
    }

    return (
      <ul class="suggestions">
        {this.searchBoxState.suggestions.map((suggestion) => {
          return (
            <li class="suggestion query-suggestion">
              {/* TODO: add icon when mixed suggestions */}
              <span innerHTML={suggestion.highlightedValue}></span>
            </li>
          );
        })}
      </ul>
    );
  }

  private renderSubmitButton() {
    return (
      <Button
        style="primary"
        class="submit-button"
        part="submit-button"
        onClick={() => this.searchBox.submit()}
      >
        <atomic-icon icon={SearchIcon} class="w-4 h-4"></atomic-icon>
      </Button>
    );
  }

  public render() {
    return (
      <div class={`container ${this.hasFocus ? 'container-focus' : ''}`}>
        {this.renderInputContainer()}
        {this.renderSuggestions()}
        {this.renderSubmitButton()}
      </div>
    );
  }
}
