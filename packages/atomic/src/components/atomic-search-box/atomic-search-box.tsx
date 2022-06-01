import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import {Component, h, State, Prop, Listen, Watch, VNode} from '@stencil/core';
import {
  SearchBox,
  SearchBoxState,
  buildSearchBox,
  loadQuerySetActions,
  QuerySetActionCreators,
  StandaloneSearchBox,
  StandaloneSearchBoxState,
  buildStandaloneSearchBox,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {Button} from '../common/button';
import {randomID} from '../../utils/utils';
import {
  isDividerElement,
  isSuggestionElement,
  SearchBoxSuggestionItem,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from '../search-box-suggestions/suggestions-common';
import {AriaLiveRegion} from '../../utils/accessibility-utils';
import {SafeStorage, StorageItems} from '../../utils/local-storage-utils';
import {promiseTimeout} from '../../utils/promise-utils';

/**
 * The `atomic-search-box` component creates a search box with built-in support for suggestions.
 *
 * @part wrapper - The search box wrapper.
 * @part input - The search box input.
 * @part loading - The search box loading animation.
 * @part clear-button - The button to clear the search box of input.
 * @part clear-icon - The clear button's icon.
 * @part submit-button - The search box submit button.
 * @part submit-icon - The search box submit button's icon.
 * @part suggestions - A list of suggested query corrections on each panel.
 * @part suggestions-left - A list of suggested query corrections on the left panel.
 * @part suggestions-right - A list of suggested query corrections on the right panel.
 * @part suggestions-wrapper - The wrapper that contains suggestions panels.
 * @part suggestion - A suggested query correction.
 * @part active-suggestion - The currently active suggestion.
 * @part suggestion-divider - An item in the list that separates groups of suggestions.
 * @part suggestion-with-query - An item in the list that will update the search box query.
 */
@Component({
  tag: 'atomic-search-box',
  styleUrl: 'atomic-search-box.pcss',
  shadow: true,
})
export class AtomicSearchBox {
  @InitializeBindings() public bindings!: Bindings;
  private searchBox!: SearchBox | StandaloneSearchBox;
  private id!: string;
  private inputRef!: HTMLInputElement;
  private listRefs: HTMLElement[] = [];
  private querySetActions!: QuerySetActionCreators;
  private pendingSuggestionEvents: SearchBoxSuggestionsEvent[] = [];
  private suggestions: SearchBoxSuggestions[] = [];

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState | StandaloneSearchBoxState;
  @State() public error!: Error;
  @State() private suggestedQuery = '';
  @State() private isExpanded = false;
  @State() private activeDescendant = '';
  @State() private previousActiveDescendantElement: HTMLLIElement | null = null;
  @State() private leftSuggestions: SearchBoxSuggestions[] = [];
  @State() private leftSuggestionElements: SearchBoxSuggestionItem[] = [];
  @State() private rightSuggestions: SearchBoxSuggestions[] = [];
  @State() private rightSuggestionElements: SearchBoxSuggestionItem[] = [];

  /**
   * The amount of queries displayed when the user interacts with the search box.
   * By default, a mix of query suggestions and recent queries will be shown.
   * You can configure those settings using the following components as children:
   *  - atomic-search-box-query-suggestions
   *  - atomic-search-box-recent-queries
   */
  @Prop({reflect: true}) public numberOfQueries = 8;

  /**
   * Defining this option makes the search box standalone.
   *
   * This option defines the default URL the user should be redirected to, when a query is submitted.
   * If a query pipeline redirect is triggered, it will redirect to that URL instead
   * (see [query pipeline triggers](https://docs.coveo.com/en/1458)).
   */
  @Prop({reflect: true}) public redirectionUrl?: string;

  /**
   * The timeout for suggestion queries, in milliseconds.
   * If a suggestion query times out, the suggestions from that particular query won't be shown.
   */
  @Prop() public suggestionTimeout = 400;

  @AriaLiveRegion('search-box')
  protected ariaMessage!: string;

  public initialize() {
    this.id = randomID('atomic-search-box-');
    this.querySetActions = loadQuerySetActions(this.bindings.engine);

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

    this.searchBox = this.redirectionUrl
      ? buildStandaloneSearchBox(this.bindings.engine, {
          options: {...searchBoxOptions, redirectionUrl: this.redirectionUrl},
        })
      : buildSearchBox(this.bindings.engine, {
          options: searchBoxOptions,
        });

    this.suggestions.push(
      ...this.pendingSuggestionEvents.map((event) =>
        event(this.suggestionBindings)
      )
    );
    this.pendingSuggestionEvents = [];
  }

  public componentDidUpdate() {
    if (!('redirectTo' in this.searchBoxState)) {
      return;
    }

    const {redirectTo, value, analytics} = this.searchBoxState;

    if (redirectTo === '') {
      return;
    }
    const data = {value, analytics};
    const storage = new SafeStorage();
    storage.setJSON(StorageItems.STANDALONE_SEARCH_BOX_DATA, data);

    window.location.href = redirectTo;
  }

  @Listen('atomic/searchBoxSuggestion/register')
  public registerSuggestions(event: CustomEvent<SearchBoxSuggestionsEvent>) {
    event.preventDefault();
    event.stopPropagation();
    if (this.searchBox) {
      this.suggestions.push(event.detail(this.suggestionBindings));
      return;
    }
    this.pendingSuggestionEvents.push(event.detail);
  }

  @Watch('redirectionUrl')
  watchRedirectionUrl() {
    this.initialize();
  }

  private get suggestionBindings(): SearchBoxSuggestionsBindings {
    return {
      ...this.bindings,
      id: this.id,
      isStandalone: !!this.redirectionUrl,
      searchBoxController: this.searchBox,
      numberOfQueries: this.numberOfQueries,
      suggestedQuery: () => this.suggestedQuery,
      clearSuggestions: () => this.clearSuggestions(),
      triggerSuggestions: () => this.triggerSuggestions(),
      getSuggestions: () => this.suggestions,
    };
  }

  private get popupId() {
    return `${this.id}-popup`;
  }

  private get hasInputValue() {
    return this.searchBoxState.value !== '';
  }

  private get hasSuggestions() {
    return !!this.allSuggestionElements.length;
  }

  private get hasActiveDescendant() {
    return this.activeDescendant !== '';
  }

  private updateActiveDescendant(activeDescendant = '') {
    this.activeDescendant = activeDescendant;
  }

  private get activeDescendantElement(): HTMLLIElement | null {
    if (!this.hasActiveDescendant) {
      return null;
    }

    return (
      this.listRefs[0]?.querySelector(`#${this.activeDescendant}`) ||
      this.listRefs[1]?.querySelector(`#${this.activeDescendant}`)
    );
  }

  private get firstValue() {
    return this.panelInFocus?.firstElementChild;
  }

  private get lastValue() {
    return this.panelInFocus?.lastElementChild;
  }

  private get nextOrFirstValue() {
    if (!this.hasActiveDescendant) {
      return this.firstValue;
    }

    return this.activeDescendantElement?.nextElementSibling || this.firstValue;
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
    return this.hasSuggestions && this.isExpanded;
  }

  private get allSuggestionElements() {
    return [...this.leftSuggestionElements, ...this.rightSuggestionElements];
  }

  private get panelInFocus() {
    return (
      this.listRefs.find((ref) =>
        ref?.contains(this.activeDescendantElement)
      ) || this.listRefs.find((panel) => panel)
    );
  }

  private getSuggestionElements(suggestions: SearchBoxSuggestions[]) {
    const elements = suggestions
      .map((suggestion) => suggestion.renderItems())
      .flat();
    const max = this.numberOfQueries + elements.filter(isDividerElement).length;

    return elements.slice(0, max);
  }

  private scrollActiveDescendantIntoView() {
    this.activeDescendantElement?.scrollIntoView({
      block: 'nearest',
    });
  }

  private focusNextValue() {
    if (!this.hasSuggestions || !this.nextOrFirstValue) {
      return;
    }

    this.updateActiveDescendant(this.nextOrFirstValue.id);
    this.scrollActiveDescendantIntoView();
    this.updateQueryFromSuggestion();
  }

  private focusPreviousValue() {
    if (!this.hasSuggestions || !this.previousOrLastValue) {
      return;
    }

    this.updateActiveDescendant(this.previousOrLastValue.id);
    this.scrollActiveDescendantIntoView();
    this.updateQueryFromSuggestion();
  }

  private focusPanel(panel: HTMLElement) {
    if (this.panelInFocus === panel) {
      return;
    }
    if (panel && panel.firstElementChild) {
      const newPrevDescendantElement = this.activeDescendantElement;
      const panelHadActiveDescendant =
        this.previousActiveDescendantElement &&
        panel.contains(this.previousActiveDescendantElement);
      this.updateActiveDescendant(
        panelHadActiveDescendant
          ? this.previousActiveDescendantElement!.id
          : panel.firstElementChild.id
      );
      this.previousActiveDescendantElement = newPrevDescendantElement;
    }
  }

  private updateAriaMessage() {
    const elsLength =
      this.allSuggestionElements.filter(isSuggestionElement).length;
    this.ariaMessage = elsLength
      ? this.bindings.i18n.t('query-suggestions-available', {
          count: elsLength,
        })
      : this.bindings.i18n.t('query-suggestions-unavailable');
  }

  private async triggerSuggestions() {
    const settled = await Promise.allSettled(
      this.suggestions.map((suggestion) =>
        promiseTimeout(
          suggestion.onInput ? suggestion.onInput() : Promise.resolve(),
          this.suggestionTimeout
        )
      )
    );

    const fulfilledSuggestions: SearchBoxSuggestions[] = [];

    settled.forEach((prom, j) => {
      if (prom.status === 'fulfilled') {
        fulfilledSuggestions.push(this.suggestions[j]);
      } else {
        console.error(
          'Some query suggestions are not being shown because the promise timed out.'
        );
      }
    });

    const splitSuggestions = (side: 'left' | 'right', isDefault = false) =>
      fulfilledSuggestions
        .filter(
          (suggestion) =>
            suggestion.panel === side || (!suggestion.panel && isDefault)
        )
        .sort(this.sortSuggestions);

    this.leftSuggestions = splitSuggestions('left', true);
    this.leftSuggestionElements = this.getSuggestionElements(
      this.leftSuggestions
    );
    this.rightSuggestions = splitSuggestions('right');
    this.rightSuggestionElements = this.getSuggestionElements(
      this.rightSuggestions
    );

    const defaultSuggestionQ =
      this.allSuggestionElements.find(isSuggestionElement)?.query || '';

    this.updateSuggestedQuery(defaultSuggestionQ);
    this.updateAriaMessage();
  }

  private sortSuggestions(a: SearchBoxSuggestions, b: SearchBoxSuggestions) {
    return a.position - b.position;
  }

  private onInput(value: string) {
    this.isExpanded = true;
    this.searchBox.updateText(value);
    this.updateActiveDescendant();
    this.triggerSuggestions();
  }

  private onFocus() {
    this.isExpanded = true;
    this.triggerSuggestions();
  }

  private clearSuggestions() {
    this.isExpanded = false;
    this.updateActiveDescendant();
    this.clearSuggestionElements();
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

  private isPanelInFocus(panel: 'right' | 'left') {
    if (!this.activeDescendantElement) {
      return false;
    }
    return this.activeDescendantElement
      ?.closest('ul')
      ?.getAttribute('part')
      ?.includes(`suggestions-${panel}`);
  }

  private updateQueryFromSuggestion() {
    const query = this.activeDescendantElement?.getAttribute('data-query');
    if (query && this.searchBoxState.value !== query) {
      this.updateQuery(query);
      this.updateSuggestedQuery(query);
    }
  }

  private updateSuggestionElements() {
    if (!this.isPanelInFocus('left')) {
      this.leftSuggestionElements = this.getSuggestionElements(
        this.leftSuggestions
      );
    }

    if (!this.isPanelInFocus('right')) {
      this.rightSuggestionElements = this.getSuggestionElements(
        this.rightSuggestions
      );
    }
  }

  private onKeyDown(e: KeyboardEvent) {
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
        this.focusPreviousValue();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.focusPanel(this.listRefs[1]);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.focusPanel(this.listRefs[0]);
        break;
    }
  }

  private renderInput() {
    return (
      <input
        part="input"
        ref={(el) => (this.inputRef = el as HTMLInputElement)}
        role="combobox"
        aria-autocomplete="both"
        aria-haspopup="true"
        aria-owns={this.popupId}
        aria-expanded={`${this.isExpanded}`}
        aria-activedescendant={this.activeDescendant}
        aria-label={this.bindings.i18n.t('search-box')}
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        placeholder={this.bindings.i18n.t('search')}
        type="text"
        class="h-full outline-none bg-transparent grow px-4 py-3.5 text-neutral-dark placeholder-neutral-dark text-lg"
        value={this.searchBoxState.value}
        onFocus={() => this.onFocus()}
        onBlur={() => this.clearSuggestions()}
        onInput={(e) => this.onInput((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => this.onKeyDown(e)}
      />
    );
  }

  private renderClearButton() {
    return (
      <Button
        style="text-transparent"
        part="clear-button"
        class="w-8 h-8 mr-1.5 text-neutral-dark"
        onClick={() => {
          this.searchBox.clear();
          this.clearSuggestionElements();
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

  private clearSuggestionElements() {
    this.leftSuggestionElements = [];
    this.rightSuggestionElements = [];
    this.ariaMessage = '';
  }

  private makeSuggestionPart(
    isSelected: boolean,
    isDivider: boolean,
    hasQuery: boolean
  ) {
    let part = 'suggestion';
    if (isSelected) {
      part += ' active-suggestion';
    }
    if (isDivider) {
      part += ' suggestion-divider';
    }
    if (hasQuery) {
      part += ' suggestion-with-query';
    }
    return part;
  }

  private renderSuggestion(
    item: SearchBoxSuggestionItem,
    index: number,
    lastIndex: number,
    side: 'left' | 'right'
  ) {
    const id = `${this.id}-${side}-suggestion-${item.key}`;
    const isSelected = id === this.activeDescendant;
    const isLast = index === lastIndex;
    const isDivider = isDividerElement(item);
    if (isLast && isDivider) {
      return null;
    }
    const hasQuery = isSuggestionElement(item) && !!item.query;
    return (
      <li
        id={id}
        key={item.key}
        part={this.makeSuggestionPart(isSelected, isDivider, hasQuery)}
        class={`flex px-4 h-10 items-center text-neutral-dark hover:bg-neutral-light cursor-pointer ${
          isSelected ? 'bg-neutral-light' : ''
        }`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          item.onSelect && item.onSelect();
          this.clearSuggestions();
        }}
        onMouseOver={() => {
          this.updateActiveDescendant(id);
          if (isSuggestionElement(item) && item.query) {
            this.updateSuggestedQuery(item.query);
          }
        }}
        ref={(el) => {
          if (isHTMLElement(item.content)) {
            el?.replaceChildren(item.content);
          }
        }}
        {...(isSuggestionElement(item) && {
          role: 'option',
          'data-query': item.query,
          'aria-selected': `${isSelected}`,
        })}
      >
        {!isHTMLElement(item.content) && item.content}
      </li>
    );
  }

  private async updateSuggestedQuery(q: string) {
    await Promise.allSettled(
      this.suggestions.map((suggestion) =>
        promiseTimeout(
          suggestion.onSuggestedQueryChange
            ? suggestion.onSuggestedQueryChange(q)
            : Promise.resolve(),
          this.suggestionTimeout
        )
      )
    );
    this.suggestedQuery = q;
    this.updateSuggestionElements();
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
        role="listbox"
      >
        {!!this.leftSuggestionElements.length && (
          <ul
            part="suggestions suggestions-left"
            aria-label={this.bindings.i18n.t('query-suggestion-list')}
            ref={(el) => {
              this.listRefs[0] = el!;
            }}
            class="flex-grow"
          >
            {this.leftSuggestionElements.map((suggestion, index) =>
              this.renderSuggestion(
                suggestion,
                index,
                this.leftSuggestionElements.length - 1,
                'left'
              )
            )}
          </ul>
        )}
        {!!this.rightSuggestionElements.length && (
          <ul
            part="suggestions suggestions-right"
            aria-label={this.bindings.i18n.t('query-suggestion-list')}
            ref={(el) => {
              this.listRefs[1] = el!;
            }}
            class="flex-grow"
          >
            {this.rightSuggestionElements.map((suggestion, index) =>
              this.renderSuggestion(
                suggestion,
                index,
                this.rightSuggestionElements.length - 1,
                'right'
              )
            )}
          </ul>
        )}
      </div>
    );
  }

  private renderSubmitButton() {
    return (
      <Button
        style="primary"
        class="w-12 h-auto rounded-r-md rounded-l-none -my-px -mr-px"
        part="submit-button"
        ariaLabel={this.bindings.i18n.t('search')}
        onClick={() => {
          this.searchBox.submit();
          this.clearSuggestionElements();
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

  public render() {
    return [
      <div
        part="wrapper"
        class="relative flex bg-background h-full w-full border border-neutral rounded-md focus-within:border-primary focus-within:ring focus-within:ring-ring-primary"
      >
        {this.renderInputContainer()}
        {this.renderSuggestions()}
        {this.renderSubmitButton()}
      </div>,
      !this.suggestions.length && (
        <slot>
          <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
          <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
        </slot>
      ),
    ];
  }
}

function isHTMLElement(el: VNode | Element): el is HTMLElement {
  return el instanceof HTMLElement;
}
