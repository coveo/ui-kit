import {Component, h, Prop, State} from '@stencil/core';
import {SearchBox, SearchBoxState, buildSearchBox} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {randomID} from '../../utils/utils';
import {Combobox} from '../../utils/combobox';

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
  @InitializeBindings() public bindings!: Bindings;
  private searchBox!: SearchBox;
  private inputRef!: HTMLInputElement;
  private valuesRef!: HTMLElement;
  private containerRef!: HTMLElement;
  private combobox!: Combobox;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState;

  @Prop() public numberOfSuggestions = 5;
  @Prop() public enableQuerySyntax = false;
  @Prop() public leadingSubmitButton = false;
  @Prop({reflect: true, attribute: 'data-id'}) public _id = randomID(
    'atomic-search-box-'
  );

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
        this.searchBox.selectSuggestion((element as HTMLButtonElement).value);
      },
      onBlur: () => {
        setTimeout(() => this.searchBox.hideSuggestions(), 100);
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
  }

  private onInputFocus() {
    this.searchBox.showSuggestions();
  }

  private onClickSuggestion(e: MouseEvent) {
    const value = (e.target as HTMLButtonElement).value;
    this.searchBox.selectSuggestion(value);
  }

  private get submitButton() {
    return (
      <button
        type="button"
        part="submit-button"
        onClick={() => this.searchBox.submit()}
      >
        <atomic-text value="search"></atomic-text>
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
        onClick={() => {
          this.searchBox.clear();
          this.inputRef.focus();
        }}
      >
        <atomic-text value="clear"></atomic-text>
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
        placeholder=""
        value={this.searchBoxState.value}
      />
    );
  }

  private get suggestions() {
    return this.searchBoxState.suggestions.map((suggestion, index) => {
      const id = `${this._id}-suggestion-${index}`;
      return (
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => this.onClickSuggestion(e)}
          onMouseDown={(e) => e.preventDefault()}
          part="suggestion"
          id={id}
          value={suggestion.rawValue}
          innerHTML={suggestion.highlightedValue}
        ></button>
      );
    });
  }

  public render() {
    return (
      <div>
        {this.leadingSubmitButton && this.submitButton}

        <div>
          <div ref={(el) => (this.containerRef = el as HTMLElement)}>
            {this.input}
            {this.clearButton}
          </div>

          <div>
            <div
              part="suggestions"
              ref={(el) => (this.valuesRef = el as HTMLElement)}
            >
              {this.suggestions}
            </div>
          </div>
        </div>

        {!this.leadingSubmitButton && this.submitButton}
      </div>
    );
  }
}
