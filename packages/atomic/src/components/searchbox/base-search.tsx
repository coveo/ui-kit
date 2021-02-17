import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
import {I18nState} from '../../utils/initialization-utils';
import {Combobox} from '../../utils/combobox';

import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';

@Component({
  tag: 'base-search',
  styleUrl: 'base-search.pcss',
  shadow: false,
})
export class BaseSearch {
  @State() public shouldShowSuggestions = false;
  @Prop() public _id!: string;
  @Prop() public value!: string;
  @Prop() public strings!: I18nState;
  @Prop() public suggestionValues!: {value: string}[];
  @Prop() public moreValuesAvailable = false;
  @Prop() public placeholder = '';
  @Prop() public leadingSubmitButton = false;
  @Prop() public hideSubmitButton = false;
  @Event() public textChange!: EventEmitter<string>;
  @Event() public search!: EventEmitter<void>;
  @Event() public selectValue!: EventEmitter<number>;
  @Event() public clear!: EventEmitter<void>;
  @Event() public showMoreResults!: EventEmitter<void>;

  private inputRef!: HTMLInputElement;
  private valuesRef!: HTMLElement;
  private containerRef!: HTMLElement;
  private combobox!: Combobox;

  constructor() {
    this.combobox = new Combobox({
      id: this._id,
      strings: this.strings,
      containerRef: () => this.containerRef,
      inputRef: () => this.inputRef,
      valuesRef: () => this.valuesRef,
      onChange: (value) => {
        this.textChange.emit(value);
      },
      onSubmit: () => this.search.emit(),
      onSelectValue: (element) =>
        this.selectValue.emit((element as HTMLLIElement).value),
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

  private get clearButton() {
    if (this.value === '') {
      return null;
    }
    return (
      <button
        type="button"
        part="clear-button"
        class="clear-button mr-2"
        aria-label={this.strings.clear()}
        onClick={() => {
          this.clear.emit();
          this.inputRef.focus();
        }}
      >
        <div
          innerHTML={ClearIcon}
          class="text-on-background fill-current h-2.5 w-2.5"
        />
      </button>
    );
  }

  private get input() {
    return (
      <input
        part="input"
        ref={(el) => (this.inputRef = el as HTMLInputElement)}
        onFocus={() => {
          this.shouldShowSuggestions = true;
        }}
        onBlur={() => this.combobox.onInputBlur()}
        onInput={(e) => this.combobox.onInputChange(e)}
        onKeyUp={(e) => this.combobox.onInputKeyup(e)}
        onKeyDown={(e) => this.combobox.onInputKeydown(e)}
        type="text"
        class={'search-input flex-grow outline-none focus:outline-none'}
        placeholder={this.placeholder}
        value={this.value}
      />
    );
  }

  private get submitButton() {
    if (this.hideSubmitButton) {
      return null;
    }
    return (
      <button
        type="button"
        part="submit-button"
        class={
          'submit-button ' + (this.leadingSubmitButton ? 'leading-submit' : '')
        }
        aria-label={this.strings.search()}
        onClick={() => this.search.emit()}
      >
        <div innerHTML={SearchIcon} class="search-icon" />
      </button>
    );
  }

  private get suggestions() {
    return this.suggestionValues.map((suggestion, index) => {
      return (
        <li
          onClick={() => this.selectValue.emit(index)}
          onMouseDown={(e) => e.preventDefault()}
          part="suggestion"
          class="suggestion cursor-pointer flex flex-row items-center"
          innerHTML={suggestion.value}
          value={index}
        />
      );
    });
  }

  private get showMoreSearchResults() {
    if (this.suggestionValues.length === 0 || !this.moreValuesAvailable) {
      return null;
    }

    return (
      <button
        class="px-1 text-primary"
        onClick={() => this.showMoreResults.emit()}
      >
        show more
      </button>
    );
  }

  public render() {
    return (
      <div class="search-box relative">
        <div
          class={
            'search-box-wrapper flex items-center ' +
            (this.suggestions.length > 0 && this.shouldShowSuggestions
              ? 'has-values'
              : '')
          }
        >
          {this.leadingSubmitButton && this.submitButton}
          <div
            class={
              'input-wrapper flex flex-grow items-center ' +
              (this.leadingSubmitButton ? 'leading-submit' : '')
            }
            ref={(el) => (this.containerRef = el as HTMLElement)}
          >
            {this.input}
            {this.clearButton}
          </div>
          {!this.leadingSubmitButton && this.submitButton}
        </div>

        <ul
          part="suggestions"
          class={
            'suggestions absolute w-full bg-background apply-border-on-background empty:border-none rounded-b ' +
            (this.shouldShowSuggestions ? 'block' : 'hidden')
          }
          ref={(el) => (this.valuesRef = el as HTMLElement)}
        >
          {this.suggestions}
          {this.showMoreSearchResults}
        </ul>
      </div>
    );
  }
}
