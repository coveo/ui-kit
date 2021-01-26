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
import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';

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
  styleUrl: 'atomic-search-box.pcss',
  shadow: false,
})
export class AtomicSearchBox implements AtomicSearchBoxOptions {
  @Element() host!: HTMLDivElement;
  @State() searchBoxState!: SearchBoxState;
  @Prop() numberOfSuggestions = 5;
  @Prop() placeholder = '';
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

  private get submitButton() {
    return (
      <button
        type="button"
        part="submit-button"
        class={
          'search w-10 bg-transparent border-0 focus:outline-none border-on-background border-solid p-0 ' +
          (this.leadingSubmitButton ? 'border-r' : 'border-l')
        }
        aria-label={this.context.i18n.t('search')}
        onClick={() => this.searchBox.submit()}
      >
        <slot name="submit-button">
          <div
            innerHTML={SearchIcon}
            class="search mx-auto w-3.5 text-on-background fill-current"
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
        class="clear bg-transparent border-none outline-none mr-2"
        aria-label={this.context.i18n.t('clear')}
        onClick={() => {
          this.searchBox.clear();
          this.inputRef.focus();
        }}
      >
        <slot name="clear-button">
          <div
            innerHTML={ClearIcon}
            class="w-2.5 text-on-background fill-current"
          />
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
        autocomplete="false"
        aria-autocomplete="list"
        aria-controls={this.valuesRef?.id}
        class="mx-2 my-0 input text-base placeholder-on-background border-none outline-none flex flex-grow flex-row align-items-center"
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
          part="suggestion"
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
          role="combobox"
          aria-owns={this.valuesRef?.id}
          aria-haspopup="listbox"
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
          class="suggestions box-border w-full lg:w-80 p-0 my-0 flex flex-col border border-t-0 border-solid border-on-background rounded-b list-none"
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
