import {
  Component,
  h,
  State,
  Prop,
  Listen,
  Watch,
  VNode,
  Element,
} from '@stencil/core';
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
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {once, randomID} from '../../../utils/utils';
import {
  queryDataAttribute,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
  elementHasNoQuery,
  elementHasQuery,
} from '../search-box-suggestions/suggestions-common';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {SafeStorage, StorageItems} from '../../../utils/local-storage-utils';
import {promiseTimeout} from '../../../utils/promise-utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';
import {SearchInput} from '../../common/search-box/search-input';
import {SearchBoxWrapper} from '../../common/search-box/search-box-wrapper';
import {SubmitButton} from '../../common/search-box/submit-button';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';
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
 * @part instant-results-item - An instant result rendered by an `atomic-search-box-instant-results` component.
 * @part instant-result-show-all-button - The button to show all items for the current instant results search rendered by an `atomic-search-box-instant-results` component.

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
  private leftPanelRef: HTMLUListElement | undefined;
  private rightPanelRef: HTMLUListElement | undefined;
  private querySetActions!: QuerySetActionCreators;
  private pendingSuggestionEvents: SearchBoxSuggestionsEvent[] = [];
  private suggestions: SearchBoxSuggestions[] = [];
  @Element() private host!: HTMLElement;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState | StandaloneSearchBoxState;
  @State() public error!: Error;
  @State() private suggestedQuery = '';
  @State() private isExpanded = false;
  @State() private activeDescendant = '';
  @State() private previousActiveDescendantElement: HTMLLIElement | null = null;
  @State() private leftSuggestions: SearchBoxSuggestions[] = [];
  @State() private leftSuggestionElements: SearchBoxSuggestionElement[] = [];
  @State() private rightSuggestions: SearchBoxSuggestions[] = [];
  @State() private rightSuggestionElements: SearchBoxSuggestionElement[] = [];

  /**
   * The amount of queries displayed when the user interacts with the search box.
   * By default, a mix of query suggestions and recent queries will be shown.
   * You can configure those settings using the following components as children:
   *  - atomic-search-box-query-suggestions
   *  - atomic-search-box-recent-queries
   */
  @Prop({reflect: true}) public numberOfQueries = 8;

  /**
   * Defining this option makes the search box standalone (see [Use a
   * Standalone Search Box](https://docs.coveo.com/en/atomic/latest/usage/ssb/)).
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

  /**
   * Whether to prevent the user from triggering a search from the component.
   * Perfect for use cases where you need to disable the search conditionally, like when the input is empty.
   */
  @Prop({reflect: true}) public disableSearch = false;

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
      getSuggestionElements: () => this.allSuggestionElements,
    };
  }
  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  private get popupId() {
    return `${this.id}-popup`;
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

  private updateDescendants(activeDescendant = '') {
    const newPrevDescendantElement = this.activeDescendantElement;

    this.updateActiveDescendant(activeDescendant);
    this.previousActiveDescendantElement = newPrevDescendantElement;
  }

  private get activeDescendantElement(): HTMLLIElement | null {
    if (!this.hasActiveDescendant) {
      return null;
    }

    return (
      this.leftPanelRef?.querySelector(`#${this.activeDescendant}`) ||
      this.rightPanelRef?.querySelector(`#${this.activeDescendant}`) ||
      null
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
    return this.hasSuggestions && this.isExpanded && !this.disableSearch;
  }

  private get allSuggestionElements() {
    return [...this.leftSuggestionElements, ...this.rightSuggestionElements];
  }

  private get panelInFocus() {
    if (this.leftPanelRef?.contains(this.activeDescendantElement)) {
      return this.leftPanelRef;
    }
    if (this.rightPanelRef?.contains(this.activeDescendantElement)) {
      return this.rightPanelRef;
    }
    return this.leftPanelRef || this.rightPanelRef;
  }

  private getSuggestionElements(suggestions: SearchBoxSuggestions[]) {
    const elements = suggestions
      .map((suggestion) => suggestion.renderItems())
      .flat();
    const max =
      this.numberOfQueries + elements.filter(elementHasNoQuery).length;

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

  private focusPanel(panel: HTMLElement | undefined) {
    if (this.panelInFocus === panel) {
      return;
    }
    if (panel && panel.firstElementChild) {
      const panelHasActiveDescendant =
        this.previousActiveDescendantElement &&
        panel.contains(this.previousActiveDescendantElement);
      this.updateDescendants(
        panelHasActiveDescendant
          ? this.previousActiveDescendantElement!.id
          : panel.firstElementChild.id
      );
    }
  }

  private updateAriaMessage() {
    const elsLength = this.allSuggestionElements.filter(elementHasQuery).length;
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

    const defaultSuggestedQuery =
      this.allSuggestionElements.find(elementHasQuery)?.query || '';

    this.updateSuggestedQuery(defaultSuggestedQuery);
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

  private isPanelInFocus(
    panel: HTMLElement | undefined,
    query: string
  ): boolean {
    if (!this.activeDescendantElement) {
      return false;
    }

    if (query) {
      const escaped = query.replace(/"/g, '\\"');
      return !!panel?.querySelector(`[${queryDataAttribute}="${escaped}"]`);
    }

    return this.activeDescendantElement?.closest('ul') === panel;
  }

  private updateQueryFromSuggestion() {
    const suggestedQuery =
      this.activeDescendantElement?.getAttribute(queryDataAttribute);
    if (suggestedQuery && this.searchBoxState.value !== suggestedQuery) {
      this.updateQuery(suggestedQuery);
      this.updateSuggestedQuery(suggestedQuery);
    }
  }

  private updateSuggestionElements(query: string) {
    if (!this.isPanelInFocus(this.leftPanelRef, query)) {
      this.leftSuggestionElements = this.getSuggestionElements(
        this.leftSuggestions
      );
    }

    if (!this.isPanelInFocus(this.rightPanelRef, query)) {
      this.rightSuggestionElements = this.getSuggestionElements(
        this.rightSuggestions
      );
    }
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
      case 'ArrowRight':
        if (this.activeDescendant || !this.searchBox.state.value) {
          e.preventDefault();
          this.focusPanel(this.rightPanelRef);
        }
        break;
      case 'ArrowLeft':
        if (this.activeDescendant || !this.searchBox.state.value) {
          e.preventDefault();
          this.focusPanel(this.leftPanelRef);
        }
        break;
    }
  }

  private clearSuggestionElements() {
    this.leftSuggestionElements = [];
    this.rightSuggestionElements = [];
    this.ariaMessage = '';
  }

  private makeSuggestionPart(
    isSelected: boolean,
    hasQuery: boolean,
    itemPart?: string
  ) {
    let part = 'suggestion';
    if (isSelected) {
      part += ' active-suggestion';
    }
    if (hasQuery) {
      part += ' suggestion-with-query';
    }
    if (itemPart) {
      part += ` ${itemPart}`;
    }
    return part;
  }

  private onSuggestionClick(item: SearchBoxSuggestionElement, e: Event) {
    item.onSelect && item.onSelect(e);
    item.query && this.clearSuggestions();
  }
  private onSuggestionMouseOver(
    item: SearchBoxSuggestionElement,
    side: 'left' | 'right',
    id: string
  ) {
    const thisPanel = side === 'left' ? this.leftPanelRef : this.rightPanelRef;
    if (this.panelInFocus === thisPanel) {
      this.updateActiveDescendant(id);
    } else {
      this.updateDescendants(id);
    }
    if (item.query) {
      this.updateSuggestedQuery(item.query);
    }
  }

  private getAriaAttributes(
    item: SearchBoxSuggestionElement,
    isSelected: boolean
  ) {
    if (item.query) {
      return {
        role: 'option',
        [queryDataAttribute]: item.query,
        'aria-selected': `${isSelected}`,
      };
    }
    return {};
  }

  private renderSuggestion(
    item: SearchBoxSuggestionElement,
    index: number,
    lastIndex: number,
    side: 'left' | 'right'
  ) {
    const id = `${this.id}-${side}-suggestion-${item.key}`;
    const isSelected = id === this.activeDescendant;
    if (index === lastIndex && item.hideIfLast) {
      return null;
    }
    return (
      <li
        id={id}
        key={item.key}
        part={this.makeSuggestionPart(isSelected, !!item.query, item.part)}
        class={`flex px-4 min-h-[40px] items-center text-neutral-dark hover:bg-neutral-light cursor-pointer ${
          isSelected ? 'bg-neutral-light' : ''
        }`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e: Event) => {
          this.onSuggestionClick(item, e);
        }}
        onMouseOver={() => {
          this.onSuggestionMouseOver(item, side, id);
        }}
        ref={(el) => {
          if (isHTMLElement(item.content)) {
            el?.replaceChildren(item.content);
          }
        }}
        {...this.getAriaAttributes(item, isSelected)}
      >
        {!isHTMLElement(item.content) && item.content}
      </li>
    );
  }

  private async updateSuggestedQuery(suggestedQuery: string) {
    const query = this.bindings.store.isMobile() ? '' : suggestedQuery;
    await Promise.allSettled(
      this.suggestions.map((suggestion) =>
        promiseTimeout(
          suggestion.onSuggestedQueryChange
            ? suggestion.onSuggestedQueryChange(query)
            : Promise.resolve(),
          this.suggestionTimeout
        )
      )
    );
    this.suggestedQuery = query;
    this.updateSuggestionElements(query);
  }

  private renderPanel(
    side: 'left' | 'right',
    elements: SearchBoxSuggestionElement[],
    setRef: (el: HTMLUListElement | undefined) => void,
    getRef: () => HTMLUListElement | undefined
  ) {
    if (!elements.length) {
      return null;
    }

    return (
      <ul
        part={`suggestions suggestions-${side}`}
        aria-label={this.bindings.i18n.t('query-suggestion-list')}
        ref={setRef}
        class="flex flex-grow basis-1/2 flex-col"
        onMouseDown={(e) => {
          if (e.target === getRef()) {
            e.preventDefault();
          }
        }}
      >
        {elements.map((suggestion, index) =>
          this.renderSuggestion(suggestion, index, elements.length - 1, side)
        )}
      </ul>
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
        role="listbox"
      >
        {this.renderPanel(
          'left',
          this.leftSuggestionElements,
          (el) => (this.leftPanelRef = el),
          () => this.leftPanelRef
        )}
        {this.renderPanel(
          'right',
          this.rightSuggestionElements,
          (el) => (this.rightPanelRef = el),
          () => this.rightPanelRef
        )}
      </div>
    );
  }

  public render() {
    this.updateBreakpoints();

    return [
      <SearchBoxWrapper disabled={this.disableSearch}>
        <SearchInput
          inputRef={this.inputRef}
          loading={this.searchBoxState.isLoading}
          ref={(el) => (this.inputRef = el as HTMLInputElement)}
          bindings={this.bindings}
          searchBox={this.searchBox}
          state={this.searchBoxState}
          disabled={this.disableSearch}
          onFocus={() => this.onFocus()}
          onInput={(e) => this.onInput((e.target as HTMLInputElement).value)}
          onBlur={() => this.clearSuggestions()}
          onKeyDown={(e) => this.onKeyDown(e)}
          aria-owns={this.popupId}
          aria-expanded={`${this.isExpanded}`}
          aria-activedescendant={this.activeDescendant}
        />
        {this.renderSuggestions()}
        <SubmitButton
          bindings={this.bindings}
          disabled={this.disableSearch}
          searchBox={this.searchBox}
        />
      </SearchBoxWrapper>,
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
