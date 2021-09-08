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
import {randomID} from '../../utils/utils';

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
  private id!: string;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState;
  @State() public error!: Error;
  @State() private isExpanded = false;
  @State() private activeDescendant = '';

  public initialize() {
    this.id = randomID('atomic-search-box-');
    this.searchBox = buildSearchBox(this.bindings.engine, {
      options: {
        id: this.id,
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

  private get popupId() {
    return `${this.id}-popup`;
  }

  private renderInput() {
    return (
      <input
        role="combobox"
        aria-autocomplete="both"
        aria-haspopup="true"
        aria-owns={this.popupId}
        aria-expanded={`${this.isExpanded}`}
        aria-activedescendant={this.activeDescendant}
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        placeholder={this.bindings.i18n.t('search')}
        aria-label={this.bindings.i18n.t('search-box')}
        type="text"
        class="h-full outline-none bg-transparent flex-grow px-4 text-neutral-dark placeholder-neutral-dark text-lg"
        value={this.searchBoxState.value}
        onFocus={() => (this.isExpanded = true)}
        onBlur={() => (this.isExpanded = false)}
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
    const id = `${this.id}-${suggestion.rawValue}`;
    const isSelected = id === this.activeDescendant;
    return (
      <li
        id={id}
        role="option"
        aria-selected={`${isSelected}`}
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

    if (!this.isExpanded) {
      return;
    }

    return (
      <ul
        id={this.popupId}
        role="listbox"
        aria-label={this.bindings.i18n.t('query-suggestion-list')}
        class="w-full absolute left-0 top-full rounded-md bg-background border border-neutral"
      >
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
        ariaLabel={this.bindings.i18n.t('search')}
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
          this.isExpanded ? 'border-primary ring ring-ring-primary' : ''
        }`}
      >
        {this.renderInputContainer()}
        {this.renderSuggestions()}
        {this.renderSubmitButton()}
      </div>
    );
  }
}
