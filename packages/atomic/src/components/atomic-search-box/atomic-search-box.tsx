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

export interface AtomicSearchBoxOptions {
  /**
   * Maximum number of suggestions to display
   * @default 5
   */
  numberOfSuggestions: number;
  /**
   * Whether the submit button should be placed before the input
   * @default false
   */
  leadingSubmitButton: boolean;
  /**
   * Placeholder text for the search box input
   * @default ''
   */
  placeholder: string;
}

@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.pcss',
  shadow: false,
})
export class AtomicSearchBox implements AtomicSearchBoxOptions {
  @InitializeBindings() public bindings!: Bindings;

  @BindStateToI18n()
  @State()
  public strings: I18nState = {
    clear: () => this.bindings.i18n.t('clear'),
    search: () => this.bindings.i18n.t('search'),
    searchBox: () => this.bindings.i18n.t('searchBox'),
    querySuggestionList: () => this.bindings.i18n.t('querySuggestionList'),
  };

  @Prop() numberOfSuggestions = 5;
  @Prop() placeholder = '';
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
        this.searchBox.hideSuggestions();
      },
      onSelectValue: (element) => {
        this.searchBox.selectSuggestion(
          this.searchBoxState.suggestions[(element as HTMLLIElement).value]
            .rawValue
        );
      },
      onBlur: () => {
        setTimeout(() => this.searchBox.hideSuggestions(), 100);
      },
      activeClass: 'active-suggestion',
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
    this.searchBox.showSuggestions();
  }

  private get submitButton() {
    return (
      <button
        type="button"
        class={
          'submit-button w-10 bg-transparent border-0 focus:outline-none border-on-background border-solid p-0 ' +
          (this.leadingSubmitButton ? 'border-r' : 'border-l')
        }
        aria-label={this.strings.search()}
        onClick={() => this.searchBox.submit()}
      >
        <div
          innerHTML={SearchIcon}
          class="search mx-auto w-3.5 h-3.5 text-on-background fill-current"
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
        ref={(el) => (this.inputRef = el as HTMLInputElement)}
        onFocus={() => this.onInputFocus()}
        onBlur={() => this.combobox.onInputBlur()}
        onInput={(e) => this.combobox.onInputChange(e)}
        onKeyUp={(e) => this.combobox.onInputKeyup(e)}
        onKeyDown={(e) => this.combobox.onInputKeydown(e)}
        type="text"
        aria-autocomplete="list"
        aria-controls={this.valuesRef?.id}
        class="input mx-2 my-0 text-base placeholder-on-background border-none outline-none flex flex-grow flex-row align-items-center"
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
          role="option"
          onClick={() => {
            this.searchBox.selectSuggestion(suggestion.rawValue);
          }}
          onMouseDown={(e) => e.preventDefault()}
          id={id}
          class="suggestion h-9 px-2 cursor-pointer text-left text-sm bg-transparent border-none shadow-none hover:bg-gray-200 flex flex-row items-center"
          innerHTML={suggestion.highlightedValue}
          value={index}
        ></li>
      );
    });
  }

  public render() {
    return (
      <div>
        <div
          class="box-border w-full lg:w-80 h-9 border border-solid rounded border-on-background flex flex-row align-items-center focus-within:rounded-b-none"
          ref={(el) => (this.containerRef = el as HTMLElement)}
        >
          {this.leadingSubmitButton && this.submitButton}
          {this.input}
          {this.clearButton}
          {!this.leadingSubmitButton && this.submitButton}
        </div>
        <ul
          id="suggestions"
          class="suggestions box-border w-full lg:w-80 p-0 my-0 flex flex-col border border-t-0 border-solid border-on-background rounded-b list-none"
          role="listbox"
          ref={(el) => (this.valuesRef = el as HTMLElement)}
        >
          {this.suggestions}
        </ul>
      </div>
    );
  }
}
