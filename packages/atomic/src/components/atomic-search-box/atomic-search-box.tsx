import {Component, h, Prop, State, Element} from '@stencil/core';
import {
  SearchBox,
  SearchBoxState,
  Unsubscribe,
  buildSearchBox,
} from '@coveo/headless';
import {
  Initialization,
  InterfaceContext,
} from '../../utils/initialization-utils';
import {randomID} from '../../utils/utils';
import {Combobox} from '../../utils/combobox';
import ClearIcon from './icons/clear.svg';
import SearchIcon from './icons/search.svg';

export interface AtomicSearchBoxOptions {
  /**
   * Maximum number of suggestions to display
   */
  numberOfSuggestions: number;
  /**
   * Wether the submit button should be place before the input
   */
  leadingSubmitButton: boolean;
}

/**
 * @part submit-button - The search box submit button
 * @part input - The search box input
 * @part clear-button - The search box input's clear button
 * @part suggestions - The list of suggestions
 * @part suggestion - The suggestion
 * @part active-suggestion - The currently active suggestion
 */
@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.css',
  shadow: true,
})
export class AtomicSearchBox implements AtomicSearchBoxOptions {
  @Element() host!: HTMLDivElement;
  @State() searchBoxState!: SearchBoxState;
  @Prop() numberOfSuggestions = 5;
  @Prop() enableQuerySyntax = false;
  @Prop() leadingSubmitButton = false;
  @Prop({reflect: true, attribute: 'data-id'}) _id = randomID(
    'atomic-search-box-'
  );

  private context!: InterfaceContext;
  private searchBox!: SearchBox;
  private unsubscribe: Unsubscribe = () => {};
  private inputRef!: HTMLInputElement;
  private valuesRef!: HTMLElement;
  private containerRef!: HTMLElement;
  private combobox!: Combobox;

  constructor() {
    this.combobox = new Combobox({
      id: this._id,
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
      activeClass: 'active',
      activePartName: 'active-suggestion',
    });
  }

  @Initialization()
  public initialize() {
    this.searchBox = buildSearchBox(this.context.engine, {
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
        enableQuerySyntax: this.enableQuerySyntax,
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

  private onInputFocus() {
    this.searchBox.showSuggestions();
  }

  private onClickSuggestion(e: MouseEvent) {
    e.preventDefault();
    const value = (e.target as HTMLLIElement).value;
    this.searchBox.selectSuggestion(
      this.searchBoxState.suggestions[value].rawValue
    );
  }

  private get submitButton() {
    return (
      <button
        type="button"
        part="submit-button"
        class={
          'submit mx-1 w-10 bg-transparent border-0 outline-none border-gray-400 border-solid p-0 ' +
          (this.leadingSubmitButton ? 'border-r' : 'border-l')
        }
        aria-label={this.context.i18n.t('search')}
        onClick={() => this.searchBox.submit()}
      >
        <slot name="submit-button">
          <div
            innerHTML={SearchIcon}
            class="search mx-auto pl-1 w-3.5 text-gray-500 fill-current"
          />
        </slot>
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
        class="bg-transparent border-none outline-none mr-1"
        aria-label={this.context.i18n.t('clear')}
        onClick={() => {
          this.searchBox.clear();
          this.inputRef.focus();
        }}
      >
        <slot name="clear-button">
          <div innerHTML={ClearIcon} class="w-2.5 text-gray-500 fill-current" />
        </slot>
      </button>
    );
  }

  private get input() {
    return (
      <input
        part="input"
        ref={(el) => (this.inputRef = el as HTMLInputElement)}
        onFocus={() => this.onInputFocus()}
        onBlur={() => this.combobox.onInputBlur()}
        onInput={(e) => this.combobox.onInputChange(e)}
        onKeyUp={(e) => this.combobox.onInputKeyup(e)}
        onKeyDown={(e) => this.combobox.onInputKeydown(e)}
        type="text"
        aria-autocomplete="list"
        aria-controls="suggestions-list"
        class="mx-1 my-0 input text-base placeholder-gray-400 border-none outline-none flex flex-grow flex-row align-items-center"
        placeholder="Search for something"
        value={this.searchBoxState.value}
      />
    );
  }

  private get suggestions() {
    return this.searchBoxState.suggestions.map((suggestion, index) => {
      const id = `${this._id}-suggestion-${index}`;
      return (
        <li
          role="result"
          tabIndex={-1}
          onClick={(e) => this.onClickSuggestion(e)}
          onMouseDown={(e) => e.preventDefault()}
          part="suggestion"
          id={id}
          class="suggestion h-7 p-2 cursor-pointer text-left text-sm bg-transparent border-none shadow-none hover:bg-gray-200 flex flex-row align-items-center"
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
          class="box-border h-9 w-80 border border-solid rounded border-gray-400 flex flex-row align-items-center focus:rounded-b-0"
          role="combobox"
          aria-owns={this.valuesRef?.id || ''}
          aria-haspopup="true"
          ref={(el) => (this.containerRef = el as HTMLElement)}
        >
          {this.leadingSubmitButton && this.submitButton}
          {this.input}
          {this.clearButton}
          {!this.leadingSubmitButton && this.submitButton}
        </div>
        <ul
          id="suggestions"
          part="suggestions"
          class="suggestions w-80 p-0 my-0 flex box-border flex-col border border-t-0 border-solid border-gray-400 rounded-b list-none"
          role="listbox"
          ref={(el) => (this.valuesRef = el as HTMLElement)}
        >
          {this.suggestions}
        </ul>
      </div>
    );
  }

  public componentDidRender() {
    this.combobox.updateAccessibilityAttributes();
  }
}
