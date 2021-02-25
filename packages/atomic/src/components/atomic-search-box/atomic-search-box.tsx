import {Component, h, Prop, State} from '@stencil/core';
import {SearchBox, SearchBoxState, buildSearchBox} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  I18nState,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {randomID} from '../../utils/utils';
import {Combobox} from '../../utils/combobox';
import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';

/**
 * A search box with built in support for query suggestions.
 *
 * @part submit-button - The search box submit button
 * @part search-input - The search box input
 * @part input-wrapper - The wrapper for the searchbox input
 * @part clear-button - The search box input's clear button
 * @part suggestions - The list of suggestions
 * @part suggestion - The suggestion
 * @part active-suggestion - The currently active suggestion
 */
@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.pcss',
  shadow: true,
})
export class AtomicSearchBox {
  @InitializeBindings() public bindings!: Bindings;

  @BindStateToI18n()
  @State()
  public strings: I18nState = {
    clear: () => this.bindings.i18n.t('clear'),
    search: () => this.bindings.i18n.t('search'),
    searchBox: () => this.bindings.i18n.t('searchBox'),
    querySuggestionList: () => this.bindings.i18n.t('querySuggestionList'),
  };
  /**
   * Maximum number of suggestions to display
   */
  @Prop() numberOfSuggestions = 5;
  /**
   * The placeholder for the search box input
   */
  @Prop() placeholder = '';
  /**
   * Whether the submit button should be placed before the input
   */
  @Prop() leadingSubmitButton = false;
  @Prop({reflect: true, attribute: 'data-id'}) public _id = randomID(
    'atomic-search-box-'
  );

  private searchBox!: SearchBox;
  private inputRef!: HTMLInputElement;
  private valuesRef!: HTMLElement;
  private containerRef!: HTMLElement;
  private combobox!: Combobox;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState;
  @State() public error!: Error;
  @State() shouldShowSuggestions = false;

  constructor() {
    this.combobox = new Combobox({
      id: this._id,
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
      activeClass: 'bg-primary text-on-primary',
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
            open: '<strong>',
            close: '</strong>',
          },
          correctionDelimiters: {
            open: '<i>',
            close: '</i>',
          },
        },
      },
    });
  }

  private onInputFocus() {
    this.shouldShowSuggestions = true;
  }

  private get submitButton() {
    let roundedClasses = this.leadingSubmitButton
      ? 'rounded-l-lg'
      : 'rounded-r-lg';

    if (this.searchBoxState.suggestions.length) {
      roundedClasses += ' rounded-bl-none rounded-br-none';
    }

    return (
      <button
        type="button"
        part="submit-button"
        class={`submit-button h-full bg-transparent border-0 focus:outline-none bg-primary p-0 ${roundedClasses}`}
        aria-label={this.strings.search()}
        onClick={() => this.searchBox.submit()}
      >
        <div
          innerHTML={SearchIcon}
          class="search mx-auto w-3.5 h-3.5 text-on-primary fill-current"
        />
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
        <div
          innerHTML={ClearIcon}
          class="w-2.5 h-2.5 text-on-background fill-current"
        />
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
          'search-input mx-2 my-0 text-base placeholder-on-background outline-none flex-grow flex-row items-center '
        }
        placeholder={this.placeholder}
        value={this.searchBoxState.value}
      />
    );
  }

  private get suggestions() {
    return this.searchBoxState.suggestions.map((suggestion, index) => {
      const id = `${this._id}-suggestion-${index}`;
      return (
        <li
          onClick={() => {
            this.searchBox.selectSuggestion(suggestion.rawValue);
          }}
          onMouseDown={(e) => e.preventDefault()}
          part="suggestion"
          id={id}
          class="suggestion h-9 px-2 cursor-pointer text-left text-sm bg-transparent border-none shadow-none flex flex-row items-center"
          innerHTML={suggestion.highlightedValue}
          value={index}
        />
      );
    });
  }

  private get suggestionList() {
    return (
      <ul
        part="suggestions"
        class={
          'suggestions absolute w-full bg-background border-on-background-variant apply-border-on-background empty:border-none rounded-b border-t-0 ' +
          (this.shouldShowSuggestions ? 'block' : 'hidden')
        }
        ref={(el) => (this.valuesRef = el as HTMLElement)}
      >
        {this.suggestions}
      </ul>
    );
  }

  private get searchBoxClasses() {
    const hasValues =
      this.searchBoxState.suggestions.length > 0 && this.shouldShowSuggestions;

    return (
      'search-box relative w-full box-border flex items-center border-divider ' +
      (hasValues ? 'has-values' : '')
    );
  }

  private get inputWrapperClasses() {
    return (
      'input-wrapper flex flex-grow items-center h-full border-on-background-variant apply-border-on-background  ' +
      (this.leadingSubmitButton
        ? 'rounded-r-lg border-l-0'
        : 'rounded-l-lg border-r-0')
    );
  }

  public render() {
    return (
      <div class={this.searchBoxClasses}>
        {this.leadingSubmitButton && this.submitButton}
        <div class="combobox flex flex-grow h-full">
          <div
            class={this.inputWrapperClasses}
            ref={(el) => (this.containerRef = el as HTMLElement)}
          >
            {this.input}
            {this.clearButton}
          </div>
          {this.suggestionList}
        </div>
        {!this.leadingSubmitButton && this.submitButton}
      </div>
    );
  }
}
