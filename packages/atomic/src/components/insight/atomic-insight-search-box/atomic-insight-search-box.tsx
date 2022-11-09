import {Component, h, Prop, State} from '@stencil/core';
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
  loadInsightQuerySetActions,
} from '..';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import {
  elementHasNoQuery,
  elementHasQuery,
  SearchBoxSuggestionElement,
} from '../../search/search-box-suggestions/suggestions-common';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {QuerySetActionCreators, Suggestion} from '@coveo/headless';
import {
  ButtonSearchSuggestion,
  queryDataAttribute,
} from '../../search/atomic-search-box/search-suggestion';
import {isMacOS} from '../../../utils/device-utils';
import {encodeForDomAttribute} from '../../../utils/string-utils';

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

  private searchBox!: InsightSearchBox;
  private id!: string;
  private inputRef!: HTMLInputElement;
  private panelRef: HTMLElement | undefined;
  private querySetActions!: QuerySetActionCreators;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: InsightSearchBoxState;
  @State() public error!: Error;
  @State() private suggestedQuery = '';
  @State() private isExpanded = false;
  @State() private suggestionElements: SearchBoxSuggestionElement[] = [];
  @State() private activeDescendant = '';

  /**
   * Whether to prevent the user from triggering a search from the component.
   * Perfect for use cases where you need to disable the search conditionally, like when the input is empty.
   */
  @Prop({reflect: true}) public disableSearch = false;
  /**
   * The number of query suggestions to display when interacting with the search box.
   */
  @Prop({reflect: true}) public numberOfSuggestions = 5;

  @AriaLiveRegion('search-box')
  protected searchBoxAriaMessage!: string;

  @AriaLiveRegion('search-suggestions', true)
  protected suggestionsAriaMessage!: string;

  public initialize() {
    this.id = randomID('atomic-search-box-');
    this.querySetActions = loadInsightQuerySetActions(this.bindings.engine);

    const searchBoxOptions = {
      id: this.id,
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
    };

    this.searchBox = buildInsightSearchBox(this.bindings.engine, {
      options: searchBoxOptions,
    });
  }

  private get popupId() {
    return `${this.id}-popup`;
  }

  private get suggestions() {
    return this.searchBoxState.suggestions;
  }

  private get firstValue() {
    return this.panelRef?.firstElementChild;
  }

  private get lastValue() {
    return this.panelRef?.lastElementChild;
  }

  private get nextOrFirstValue() {
    if (!this.hasActiveDescendant) {
      return this.firstValue;
    }

    return this.activeDescendantElement?.nextElementSibling || this.firstValue;
  }

  private get hasActiveDescendant() {
    return this.activeDescendant !== '';
  }

  private get hasSuggestions() {
    return !!this.suggestionElements.length;
  }

  private get activeDescendantElement(): HTMLElement | null {
    if (!this.hasActiveDescendant) {
      return null;
    }

    return this.panelRef?.querySelector(`#${this.activeDescendant}`) || null;
  }

  private get previousOrLastValue() {
    if (!this.hasActiveDescendant) {
      return this.lastValue;
    }

    return (
      this.activeDescendantElement?.previousElementSibling || this.lastValue
    );
  }
  private get showSuggestions() {
    return this.hasSuggestions && this.isExpanded && !this.disableSearch;
  }

  private updateActiveDescendant(activeDescendant = '') {
    this.activeDescendant = activeDescendant;
  }

  private clearSuggestionElements() {
    this.suggestionElements = [];
    this.searchBoxAriaMessage = '';
  }

  private clearSuggestions() {
    this.isExpanded = false;
    this.updateActiveDescendant();
    this.clearSuggestionElements();
  }

  private scrollActiveDescendantIntoView() {
    this.activeDescendantElement?.scrollIntoView({
      block: 'nearest',
    });
  }

  private onSubmit() {
    if (this.activeDescendantElement) {
      this.activeDescendantElement.click();
      this.updateActiveDescendant();
      return;
    }

    this.searchBox.submit();
    this.updateActiveDescendant();
    this.clearSuggestions();
  }

  private updateQuery(query: string) {
    this.bindings.engine.dispatch(
      this.querySetActions.updateQuerySetQuery({
        id: this.id,
        query,
      })
    );
  }

  private updateQueryFromSuggestion() {
    const suggestedQuery =
      this.activeDescendantElement?.getAttribute(queryDataAttribute);
    if (suggestedQuery && this.searchBoxState.value !== suggestedQuery) {
      this.updateQuery(suggestedQuery);
      this.updateSuggestedQuery(suggestedQuery);
    }
  }

  private updateAriaLiveActiveDescendant(value: HTMLElement) {
    if (isMacOS()) {
      this.suggestionsAriaMessage = value.ariaLabel!;
    }
  }

  private focusPreviousValue() {
    if (!this.hasSuggestions || !this.previousOrLastValue) {
      return;
    }

    this.focusValue(this.previousOrLastValue as HTMLElement);
  }

  private focusValue(value: HTMLElement) {
    this.updateActiveDescendant(value.id);
    this.scrollActiveDescendantIntoView();
    this.updateQueryFromSuggestion();
    this.updateAriaLiveActiveDescendant(value);
  }

  private updateSuggestionElements() {
    this.suggestionElements = this.getSuggestionElements(this.suggestions);
  }

  private getSuggestionElements(suggestions: Suggestion[]) {
    const elements = suggestions.map((suggestion) =>
      this.renderSuggestionItem(suggestion)
    );
    const max =
      this.numberOfSuggestions + elements.filter(elementHasNoQuery).length;

    return elements.slice(0, max);
  }

  private focusNextValue() {
    if (!this.hasSuggestions || !this.nextOrFirstValue) {
      return;
    }

    this.focusValue(this.nextOrFirstValue as HTMLElement);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (this.disableSearch) {
      return;
    }

    switch (e.key) {
      case 'Enter':
        this.onSubmit();
        break;
      case 'Escape':
        this.clearSuggestions();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.focusNextValue();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (this.firstValue === this.activeDescendantElement) {
          this.updateActiveDescendant();
        } else {
          this.focusPreviousValue();
        }
        break;
      case 'Tab':
        this.clearSuggestions();
        break;
    }
  }

  private updateAriaMessage() {
    const elsLength = this.suggestionElements.filter(elementHasQuery).length;
    this.searchBoxAriaMessage = elsLength
      ? this.bindings.i18n.t('query-suggestions-available', {
          count: elsLength,
        })
      : this.bindings.i18n.t('query-suggestions-unavailable');
  }

  private async triggerSuggestions() {
    const defaultSuggestedQuery =
      this.suggestionElements.find(elementHasQuery)?.query || '';

    this.updateSuggestedQuery(defaultSuggestedQuery);
    this.updateAriaMessage();
  }

  private onFocus() {
    this.isExpanded = true;
    this.triggerSuggestions();
  }

  private async updateSuggestedQuery(suggestedQuery: string) {
    this.suggestedQuery = suggestedQuery;
    this.updateSuggestionElements();
  }

  private onSuggestionClick(item: SearchBoxSuggestionElement, e: Event) {
    item.onSelect && item.onSelect(e);
    item.query && this.clearSuggestions();
  }

  private renderSuggestion(
    item: SearchBoxSuggestionElement,
    index: number,
    lastIndex: number
  ) {
    const id = `${this.id}-suggestion-${item.key}`;

    const isSelected =
      id === this.activeDescendant || this.suggestedQuery === item.query;

    if (index === lastIndex && item.hideIfLast) {
      return null;
    }

    return (
      <ButtonSearchSuggestion
        bindings={this.bindings}
        id={id}
        suggestion={item}
        isSelected={isSelected}
        side={'left'}
        index={index}
        lastIndex={lastIndex}
        isDoubleList={false}
        onClick={(e: Event) => {
          this.onSuggestionClick(item, e);
        }}
      ></ButtonSearchSuggestion>
    );
  }

  private renderSuggestionItem(
    suggestion: Suggestion
  ): SearchBoxSuggestionElement {
    const hasQuery = this.searchBox.state.value !== '';
    return {
      part: 'query-suggestion-item',
      content: (
        <div part="query-suggestion-content" class="flex items-center">
          {this.suggestions.length > 1 && (
            <atomic-icon
              part="query-suggestion-icon"
              icon={SearchIcon}
              class="w-4 h-4 mr-2 shrink-0"
            ></atomic-icon>
          )}
          {hasQuery ? (
            // deepcode ignore ReactSetInnerHtml: This is not React code, deepcode ignore DOMXSS: Value escaped in upstream code.
            <span
              part="query-suggestion-text"
              class="break-all line-clamp-2"
              // deepcode ignore ReactSetInnerHtml: This is not React code, deepcode ignore DOMXSS: Value escaped in upstream code.
              innerHTML={suggestion.highlightedValue}
            ></span>
          ) : (
            <span part="query-suggestion-text" class="break-all line-clamp-2">
              {suggestion.rawValue}
            </span>
          )}
        </div>
      ),
      key: `qs-${encodeForDomAttribute(suggestion.rawValue)}`,
      query: suggestion.rawValue,
      ariaLabel: this.bindings.i18n.t('query-suggestion-label', {
        query: suggestion.rawValue,
        interpolation: {escapeValue: false},
      }),
      onSelect: () => {
        this.searchBox.selectSuggestion(suggestion.rawValue);
      },
    };
  }

  private renderPanel(
    elements: SearchBoxSuggestionElement[],
    setRef: (el: HTMLElement | undefined) => void,
    getRef: () => HTMLElement | undefined
  ) {
    if (!elements.length) {
      return null;
    }

    return (
      <div
        part={'suggestions'}
        ref={setRef}
        class="flex flex-grow basis-1/2 flex-col"
        onMouseDown={(e) => {
          if (e.target === getRef()) {
            e.preventDefault();
          }
        }}
      >
        {elements.map((suggestion, index) =>
          this.renderSuggestion(suggestion, index, elements.length - 1)
        )}
      </div>
    );
  }

  private renderSuggestions() {
    if (!this.hasSuggestions) {
      return null;
    }

    return (
      <div
        id={this.popupId}
        part="suggestions-wrapper"
        class={`flex w-full z-10 absolute left-0 top-full rounded-md bg-background border border-neutral ${
          this.showSuggestions ? '' : 'hidden'
        }`}
        role="application"
        aria-label={this.bindings.i18n.t('search-suggestions-single-list')}
        aria-activedescendant={this.activeDescendant}
      >
        {this.renderPanel(
          this.suggestionElements,
          (el) => (this.panelRef = el),
          () => this.panelRef
        )}
      </div>
    );
  }

  public render() {
    return (
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
            onFocus={() => this.onFocus()}
            onKeyDown={(e) => this.onKeyDown(e)}
            onClear={() => this.searchBox.clear()}
            onInput={(e) => {
              this.searchBox.updateText((e.target as HTMLInputElement).value);
            }}
          />
          {this.renderSuggestions()}
        </atomic-focus-detector>
      </SearchBoxWrapper>
    );
  }
}
