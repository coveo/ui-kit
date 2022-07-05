import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import {Component, h, Prop, State} from '@stencil/core';
import {Button} from '@components/common/button';
import {Bindings} from '../atomic-insight-interface/atomic-insight-interface';
import {
  BindStateToController,
  InitializeBindings,
} from '@utils/initialization-utils';
import {buildInsightSearchBox} from '@coveo/headless/insight';
import {SearchBox, SearchBoxState} from '@coveo/headless';
import {randomID} from '@utils/utils';

/**
 *
 * @internal
 */
@Component({
  tag: 'atomic-insight-search-box',
  styleUrl: 'atomic-insight-search-box.pcss',
  shadow: true,
})
export class AtomicInsightSearchBox {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  private id!: string;
  private searchBox!: SearchBox;
  private inputRef!: HTMLInputElement;

  private get hasInputValue() {
    return this.searchBoxState.value !== '';
  }

  /**
   * Whether to prevent the user from triggering a search from the component.
   * Perfect for use cases where you need to disable the search conditionally, like when the input is empty.
   */
  @Prop({reflect: true}) public disableSearch = false;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState;

  private onInput(value: string) {
    this.searchBox.updateText(value);
  }

  public initialize() {
    this.id = randomID('atomic-search-box-');

    const searchBoxOptions = {
      id: this.id,
      numberOfSuggestions: 0,
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
    };
    this.searchBox = buildInsightSearchBox(this.bindings.engine, {
      options: searchBoxOptions,
    });
  }

  private onKeyDown(e: KeyboardEvent) {
    if (this.disableSearch) {
      return;
    }

    switch (e.key) {
      case 'Enter':
        this.searchBox.submit();
        break;
    }
  }

  private renderClearButton() {
    return (
      <Button
        style="text-transparent"
        part="clear-button"
        class="w-8 h-8 mr-1.5 text-neutral-dark"
        onClick={() => {
          this.searchBox.clear();
          this.inputRef.focus();
        }}
        ariaLabel={this.bindings.i18n.t('clear')}
      >
        <atomic-icon
          part="clear-icon"
          icon={ClearIcon}
          class="w-3 h-3"
        ></atomic-icon>
      </Button>
    );
  }
  private renderInputContainer() {
    const isLoading = this.searchBoxState.isLoading;
    return (
      <div class="grow flex items-center">
        {this.renderInput()}
        {isLoading && (
          <span
            part="loading"
            class="loading w-5 h-5 rounded-full bg-gradient-to-r animate-spin mr-3 grid place-items-center"
          ></span>
        )}
        {!isLoading && this.hasInputValue && this.renderClearButton()}
      </div>
    );
  }
  private renderSubmitButton() {
    return (
      <Button
        style="primary"
        class="w-12 h-auto rounded-r-md rounded-l-none -my-px -mr-px"
        part="submit-button"
        disabled={this.disableSearch}
        ariaLabel={this.bindings.i18n.t('search')}
        onClick={() => {
          this.searchBox.submit();
        }}
      >
        <atomic-icon
          part="submit-icon"
          icon={SearchIcon}
          class="w-4 h-4"
        ></atomic-icon>
      </Button>
    );
  }

  private renderInput() {
    return (
      <input
        ref={(el) => (this.inputRef = el as HTMLInputElement)}
        part="input"
        aria-autocomplete="both"
        aria-haspopup="true"
        aria-label={this.bindings.i18n.t('search-box')}
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        placeholder={this.bindings.i18n.t('search')}
        type="text"
        class="h-full outline-none bg-transparent w-0 grow px-4 py-3.5 text-neutral-dark placeholder-neutral-dark text-lg"
        value={this.searchBoxState.value}
        onInput={(e) => this.onInput((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => this.onKeyDown(e)}
      />
    );
  }
  public render() {
    return (
      <div
        part="wrapper"
        class="relative flex bg-background h-full w-full border border-neutral rounded-md focus-within:ring"
      >
        {this.renderInputContainer()}
        {this.renderSubmitButton()}
      </div>
    );
  }
}
