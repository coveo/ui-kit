import {Component, h, Listen, Prop, State} from '@stencil/core';
import {randomID} from '../../../utils/utils';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import {SearchInput} from '../../common/search-box/search-input';
import {SearchBoxWrapper} from '../../common/search-box/search-box-wrapper';
import {
  buildInsightSearchBox,
  InsightSearchBox,
  InsightSearchBoxState,
} from '..';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import {
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from '../../search/search-box-suggestions/suggestions-common';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-search-box',
  styleUrl: 'atomic-insight-search-box.pcss',
  shadow: true,
})
export class AtomicInsightSearchBox {
  @InitializeBindings() public bindings!: InsightBindings;
  @State() public error!: Error;

  private id!: string;
  private searchBox!: InsightSearchBox;
  private inputRef!: HTMLInputElement;
  private suggestionEvents: SearchBoxSuggestionsEvent[] = [];
  private suggestions: SearchBoxSuggestions[] = [];

  /**
   * Whether to prevent the user from triggering a search from the component.
   * Perfect for use cases where you need to disable the search conditionally, like when the input is empty.
   */
  @Prop({reflect: true}) public disableSearch = false;
  /**
   * The number of query suggestions to display when interacting with the search box.
   */
  @Prop({reflect: true}) public numberOfSuggestions = 5;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: InsightSearchBoxState;

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

    this.suggestions = this.suggestionEvents.map((event) =>
      event(this.suggestionBindings)
    );
  }

  @Listen('atomic/searchBoxSuggestion/register')
  public registerSuggestions(event: CustomEvent<SearchBoxSuggestionsEvent>) {
    event.preventDefault();
    event.stopPropagation();
    this.suggestionEvents.push(event.detail);
    if (this.searchBox) {
      this.suggestions.push(event.detail(this.suggestionBindings));
    }
  }

  private get suggestionBindings(): SearchBoxSuggestionsBindings {
    return {
      ...this.bindings,
      id: this.id,
      isStandalone: false,
      searchBoxController: this.searchBox,
      numberOfQueries: this.numberOfQueries,
      clearFilters: this.clearFilters,
      suggestedQuery: () => this.suggestedQuery,
      clearSuggestions: () => this.clearSuggestions(),
      triggerSuggestions: () => this.triggerSuggestions(),
      getSuggestions: () => this.suggestions,
      getSuggestionElements: () => this.allSuggestionElements,
    };
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

  public render() {
    return [
      <SearchBoxWrapper disabled={this.disableSearch}>
        <atomic-focus-detector onFocusExit={() => this.clearSuggestions()}>
          <atomic-icon
            part="submit-icon"
            icon={SearchIcon}
            class="w-4 h-full my-auto mr-0 ml-4"
          />
          <SearchInput
            inputRef={this.inputRef}
            loading={this.searchBoxState.isLoading}
            ref={(el) => (this.inputRef = el as HTMLInputElement)}
            bindings={this.bindings}
            value={this.searchBoxState.value}
            ariaLabel={this.bindings.i18n.t('search-box')}
            placeholder={this.bindings.i18n.t('search-ellipsis')}
            onKeyDown={(e) => this.onKeyDown(e)}
            onClear={() => this.searchBox.clear()}
            onInput={(e) => {
              this.searchBox.updateText((e.target as HTMLInputElement).value);
            }}
          />
        </atomic-focus-detector>
      </SearchBoxWrapper>,
      !this.suggestions.length && (
        <slot>
          <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
        </slot>
      ),
    ];
  }
}
