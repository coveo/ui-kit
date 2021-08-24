import {Component, h, Prop, State} from '@stencil/core';
import {SearchBox, SearchBoxState, buildSearchBox} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {randomID} from '../../utils/utils';
import {Combobox, ComboboxStrings} from '../../utils/combobox';
import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';

/**
 * The `atomic-search-box` component creates a search box with built-in support for query suggestions.
 *
 * @part submit-button - The search box submit button.
 * @part search-input - The search box input.
 * @part input-wrapper - The wrapper for the searchbox input area.
 * @part clear-button - The button to clear the search box of input.
 * @part suggestions - A list of suggested query corrections.
 * @part suggestion - A suggested query correction.
 * @part active-suggestion - The currently active suggestion.
 */
@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.pcss',
  shadow: true,
})
export class AtomicSearchBox {
  @InitializeBindings() public bindings!: Bindings;

  public strings: ComboboxStrings = {
    clear: () => this.bindings.i18n.t('clear'),
    search: () => this.bindings.i18n.t('search'),
    searchBox: () => this.bindings.i18n.t('search-box'),
    querySuggestionList: () => this.bindings.i18n.t('query-suggestion-list'),
  };
  /**
   * The maximum number of suggestions to display.
   */
  @Prop() numberOfSuggestions = 5;
  /**
   * The placeholder text to display in the search box input area.
   */
  @Prop() placeholder = '';
  /**
   * Whether the submit button is placed before the input.
   */
  @Prop() leadingSubmitButton = false;

  private searchBox!: SearchBox;
  private inputRef!: HTMLInputElement;
  private valuesRef!: HTMLElement;
  private containerRef!: HTMLElement;
  private combobox!: Combobox;
  private searchboxID: string;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState;
  @State() public error!: Error;
  @State() shouldShowSuggestions = false;

  constructor() {
    this.searchboxID = randomID('atomic-search-box-');
    this.combobox = new Combobox({
      id: this.searchboxID,
      strings: this.strings,
      containerRef: () => this.containerRef,
      inputRef: () => this.inputRef,
      valuesRef: () => this.valuesRef,
      onChange: (value) => {
        this.searchBox.updateText(value);
      },
      onSubmit: () => {
        this.searchBox.submit();
        this.shouldShowSuggestions = false;
      },
      onSelectValue: (element) => {
        this.searchBox.selectSuggestion(
          this.searchBoxState.suggestions[(element as HTMLLIElement).value]
            .rawValue
        );
      },
      onBlur: () => {
        this.shouldShowSuggestions = false;
      },
      activeClass: 'active',
      activePartName: 'active-suggestion',
    });
  }

  public componentDidRender() {
    this.combobox.updateAccessibilityAttributes();
  }

  public initialize() {
    this.searchBox = buildSearchBox(this.bindings.engine, {
      options: {
        numberOfSuggestions: this.numberOfSuggestions,
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

  private onInputFocus() {
    this.shouldShowSuggestions = true;
    if (!this.searchBoxState.suggestions.length) {
      this.searchBox.showSuggestions();
    }
  }

  private get submitButton() {
    let roundedClasses = this.leadingSubmitButton ? 'rounded-l' : 'rounded-r';

    if (this.searchBoxState.suggestions.length && this.shouldShowSuggestions) {
      roundedClasses += ' rounded-bl-none rounded-br-none';
    }

    return (
      <button
        type="button"
        part="submit-button"
        class={`submit-button grid place-items-center h-full border-0 no-outline focus:bg-primary-light hover:bg-primary-light bg-primary p-0 ${roundedClasses}`}
        aria-label={this.strings.search()}
        onClick={() => this.searchBox.submit()}
      >
        <atomic-icon
          icon={SearchIcon}
          class="search w-3.5 h-3.5 text-on-primary"
        ></atomic-icon>
      </button>
    );
  }

  private get clearButton() {
    if (this.searchBoxState.value === '') {
      return;
    }

    return (
      <button
        type="button"
        part="clear-button"
        class="clear-button bg-transparent border-none outline-none mr-2"
        aria-label={this.strings.clear()}
        onClick={() => {
          this.searchBox.clear();
          this.inputRef.focus();
        }}
      >
        <atomic-icon
          icon={ClearIcon}
          class="w-2.5 h-2.5 text-on-background"
        ></atomic-icon>
      </button>
    );
  }

  private get input() {
    return (
      <input
        part="search-input"
        ref={(el) => (this.inputRef = el as HTMLInputElement)}
        onFocus={() => this.onInputFocus()}
        onBlur={() => this.combobox.onInputBlur()}
        onInput={(e) => this.combobox.onInputChange(e)}
        onKeyUp={(e) => this.combobox.onInputKeyup(e)}
        onKeyDown={(e) => this.combobox.onInputKeydown(e)}
        type="text"
        class={
          'search-input bg-background mx-2 my-0 text-base placeholder-on-background outline-none flex-grow flex-row items-center '
        }
        placeholder={this.placeholder}
        value={this.searchBoxState.value}
      />
    );
  }

  private get suggestions() {
    return this.searchBoxState.suggestions.map((suggestion, index) => {
      const id = `${this.searchboxID}-suggestion-${index}`;
      return (
        <li
          onClick={() => {
            this.searchBox.selectSuggestion(suggestion.rawValue);
          }}
          onMouseDown={(e) => e.preventDefault()}
          part="suggestion"
          id={id}
          class="suggestion h-9 px-2 cursor-pointer text-left flex flex-row items-center border-l border-r border-neutral"
          value={index}
        >
          <pre class="font-sans" innerHTML={suggestion.highlightedValue}></pre>
        </li>
      );
    });
  }

  private get suggestionList() {
    return (
      <ul
        part="suggestions"
        class={`suggestions w-full p-0 my-0 flex flex-col bg-background list-none absolute z-50 ${
          this.shouldShowSuggestions ? 'block' : 'hidden'
        }`}
        ref={(el) => (this.valuesRef = el as HTMLElement)}
      >
        {this.suggestions}
      </ul>
    );
  }

  private renderInputWrapper() {
    let roundedClasses = this.leadingSubmitButton
      ? 'border-l-0 rounded-r'
      : 'border-r-0 rounded-l';

    if (this.searchBoxState.suggestions.length && this.shouldShowSuggestions) {
      roundedClasses += ' rounded-bl-none rounded-br-none';
    }

    return (
      <div
        part="input-wrapper"
        ref={(el) => (this.containerRef = el as HTMLElement)}
        class={`input-wrapper flex flex-grow items-center border border-neutral bg-white ${roundedClasses}`}
      >
        {this.input}
        {this.clearButton}
      </div>
    );
  }

  public render() {
    return (
      <div class="search-box relative w-full box-border flex items-center border-neutral">
        {this.leadingSubmitButton && this.submitButton}
        <div class="combobox flex flex-grow h-full">
          {this.renderInputWrapper()}
          {this.suggestionList}
        </div>
        {!this.leadingSubmitButton && this.submitButton}
      </div>
    );
  }
}
