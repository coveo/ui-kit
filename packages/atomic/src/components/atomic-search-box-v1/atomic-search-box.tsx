import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import {Component, h, State} from '@stencil/core';
import {
  SearchBox,
  SearchBoxState,
  buildSearchBox,
  Suggestion,
} from '@coveo/headless';
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

  private renderInput() {
    return (
      <input
        placeholder={this.bindings.i18n.t('search')}
        aria-label={this.bindings.i18n.t('search-box')}
        type="text"
        class="h-full outline-none bg-transparent flex-grow px-4 text-neutral-dark placeholder-neutral-dark text-lg"
        value={this.searchBoxState.value}
        onFocus={() => (this.hasFocus = true)}
        onBlur={() => (this.hasFocus = false)}
        onInput={(e) =>
          this.searchBox.updateText((e.target as HTMLInputElement).value)
        }
      />
    );
  }

  private renderClearButton() {
    return (
      <Button
        style="text-transparent"
        part="clear-button"
        class="w-8 h-8 mr-1.5 text-neutral-dark"
        onClick={() => this.searchBox.clear()}
        ariaLabel={this.bindings.i18n.t('clear')}
      >
        <atomic-icon icon={ClearIcon} class="w-3 h-3"></atomic-icon>
      </Button>
    );
  }

  private renderInputContainer() {
    const isLoading = this.searchBoxState.isLoading;
    const hasValue = this.searchBoxState.value.trim() !== '';
    return (
      <div class="flex-grow flex items-center">
        {this.renderInput()}
        {isLoading && (
          <span class="loading w-5 h-5 rounded-full bg-gradient-to-r animate-spin mr-3 grid place-items-center"></span>
        )}
        {!isLoading && hasValue && this.renderClearButton()}
      </div>
    );
  }

  // TODO: move inside the atomic-query-suggestions/atomic-recent-queries components
  private renderSuggestion(suggestion: Suggestion) {
    return (
      <li
        key={suggestion.rawValue}
        class="flex px-4 h-10 items-center text-neutral-dark hover:bg-neutral-light cursor-pointer first:rounded-t-md last:rounded-b-md"
      >
        {/* TODO: add icon when mixed suggestions */}
        <span innerHTML={suggestion.highlightedValue}></span>
      </li>
    );
  }

  private renderSuggestions() {
    if (!this.searchBoxState.suggestions.length) {
      return;
    }

    if (!this.hasFocus) {
      return;
    }

    return (
      <ul class="w-full absolute left-0 top-full rounded-md bg-background border border-neutral">
        {this.searchBoxState.suggestions.map((suggestion) =>
          this.renderSuggestion(suggestion)
        )}
      </ul>
    );
  }

  private renderSubmitButton() {
    return (
      <Button
        style="primary"
        class="w-12 h-full rounded-r-md rounded-l-none"
        part="submit-button"
        onClick={() => this.searchBox.submit()}
      >
        <atomic-icon icon={SearchIcon} class="w-4 h-4"></atomic-icon>
      </Button>
    );
  }

  public render() {
    return (
      <div
        class={`relative flex bg-background h-full w-full box-border border-neutral rounded-md ${
          this.hasFocus ? 'border-primary ring ring-ring-primary' : ''
        }`}
      >
        {this.renderInputContainer()}
        {this.renderSuggestions()}
        {this.renderSubmitButton()}
      </div>
    );
  }
}
