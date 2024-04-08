import {isNullOrUndefined} from '@coveo/bueno';
import {VNode} from '@stencil/core';
import {debounce} from '../../../utils/debounce-utils';
import {promiseTimeout} from '../../../utils/promise-utils';
import {
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
  elementHasNoQuery,
  elementHasQuery,
} from '../../search/search-box-suggestions/suggestions-common';

/**
 * Element which will be rendered in the list of suggestions.
 */
export interface SearchBoxSuggestionElement {
  /**
   * Stable identity which enables Stencil to reuse DOM elements for better performance.
   * The best way to pick a key is to use a string that uniquely identifies that list item among its siblings (often your data will already have IDs).
   */
  key: string;
  /**
   * Rendered content of the element.
   */
  content: Element | VNode;
  /**
   * Hook called when the selection is selected.
   * @param e DOM event.
   */
  onSelect?(e: Event): void;
  /**
   * The query associated with the suggestion which will replace the query in the search box if the suggestion is selected.
   */
  query?: string;
  /**
   * For improved accessibility, provide this property with additional information.
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
   */
  ariaLabel?: string;
  /**
   * Adds a specific shadow part attribute that can be selected with the CSS ::part pseudo-element.
   * https://developer.mozilla.org/en-US/docs/Web/CSS/::part
   */
  part?: string;
  /**
   * Hide the suggestion if it's the last in the list.
   */
  hideIfLast?: boolean;
}

/**
 * List of suggestions that will be displayed along other lists (e.g recent queries) when the search box's input is selected.
 */
export interface SearchBoxSuggestions {
  /**
   * The search box will sort the position of suggestions using this value. The lowest value being first.
   * By default, the DOM position will be used.
   */
  position: number;
  /**
   * Whether the suggestions should be listed in the right or left panel. By default, the suggestions are listed in the right panel.
   */
  panel?: 'left' | 'right';
  /**
   * Method that returns the list of elements which will be rendered in the list of suggestions.
   */
  renderItems(): SearchBoxSuggestionElement[];
  /**
   * Hook called when the user changes the search box's input value. This can lead to all the query suggestions being updated.
   */
  onInput?(): Promise<unknown> | void;
  /**
   * Hook called when the suggested query changes as a user traverses through the list of suggestions.
   * This is used for instant results, which are rendered based on the current suggested query.
   * @param q The new suggested query.
   */
  onSuggestedQueryChange?(q: string): Promise<unknown> | void;
}

interface SearchBoxProps {
  getSearchBoxValue: () => string;
  updateQuery: (suggestedQuery: string) => void;
  getSuggestionTimeout: () => number;
  getNumberOfSuggestionsToDisplay: () => number;
  getSuggestionDelay: () => number;
}

export class SuggestionManager {
  public suggestions: SearchBoxSuggestions[] = [];
  public leftSuggestionElements: SearchBoxSuggestionElement[] = [];
  public rightSuggestionElements: SearchBoxSuggestionElement[] = [];
  public leftPanel: HTMLElement | undefined = undefined;
  public rightPanel: HTMLElement | undefined = undefined;
  public triggerSuggestions: () => Promise<void>;

  private queryDataAttribute = 'data-query';
  private suggestionEvents: SearchBoxSuggestionsEvent[] = [];
  private suggestedQuery = '';
  private activeDescendant = '';
  private previousActiveDescendantElement: HTMLElement | null = null;
  private leftSuggestions: SearchBoxSuggestions[] = [];
  private rightSuggestions: SearchBoxSuggestions[] = [];

  constructor(
    private ownerSearchBoxProps: SearchBoxProps,
    private getIsMobile: () => boolean,
    private logger: Pick<typeof console, 'warn'>
  ) {
    this.triggerSuggestions = debounce(
      () => this.executeQuerySuggestion(),
      this.ownerSearchBoxProps.getSuggestionDelay()
    );
  }

  public get partialSuggestionBindings(): Pick<
    SearchBoxSuggestionsBindings,
    | 'suggestedQuery'
    | 'clearSuggestions'
    | 'triggerSuggestions'
    | 'getSuggestions'
    | 'getSuggestionElements'
  > {
    return {
      suggestedQuery: () => this.suggestedQuery,
      clearSuggestions: () => this.clearSuggestions(),
      triggerSuggestions: () => this.triggerSuggestions(),
      getSuggestions: () => this.suggestions,
      getSuggestionElements: () => this.allSuggestionElements,
    };
  }

  public get activeDescendantElement(): HTMLElement | null {
    if (!this.hasActiveDescendant) {
      return null;
    }

    return (
      this.leftPanel?.querySelector(`#${this.activeDescendant}`) ||
      this.leftPanel?.querySelector(`#${this.activeDescendant}`) ||
      null
    );
  }

  public onSubmit() {
    this.updateActiveDescendant();
    this.clearSuggestions();
  }

  public updateActiveDescendant(id = '') {
    this.activeDescendant = id;
  }

  public clickOnActiveElement() {
    this.activeDescendantElement?.click();
    this.updateActiveDescendant();
  }

  public isRightPanelInFocus() {
    return this.panelInFocus === this.rightPanel;
  }

  public initializeSuggestions(bindings: SearchBoxSuggestionsBindings) {
    this.suggestions = this.suggestionEvents.map((event) => event(bindings));
  }

  public registerSuggestions(
    event: CustomEvent<SearchBoxSuggestionsEvent>,
    bindings: SearchBoxSuggestionsBindings
  ) {
    event.preventDefault();
    event.stopPropagation();
    this.suggestionEvents.push(event.detail);
    this.suggestions.push(event.detail(bindings));
  }

  public get isDoubleList() {
    return Boolean(
      this.leftSuggestionElements.length && this.rightSuggestionElements.length
    );
  }

  private async executeQuerySuggestion() {
    this.updateActiveDescendant();
    const settled = await Promise.allSettled(
      this.suggestions.map((suggestion) =>
        promiseTimeout(
          suggestion.onInput ? suggestion.onInput() : Promise.resolve(),
          this.ownerSearchBoxProps.getSuggestionTimeout()
        )
      )
    );

    const fulfilledSuggestions: SearchBoxSuggestions[] = [];

    settled.forEach((prom, j) => {
      if (prom.status === 'fulfilled') {
        fulfilledSuggestions.push(this.suggestions[j]);
      } else {
        this.logger.warn(
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
    this.leftSuggestionElements = this.getAndFilterLeftSuggestionElements();

    this.rightSuggestions = splitSuggestions('right');
    this.rightSuggestionElements = this.getSuggestionElements(
      this.rightSuggestions
    );

    const defaultSuggestedQuery =
      this.allSuggestionElements.find(elementHasQuery)?.query || '';

    this.updateSuggestedQuery(defaultSuggestedQuery);
    //this.updateAriaMessage();
  }

  public focusPanel(side: 'left' | 'right') {
    const panel = side === 'left' ? this.leftPanel : this.rightPanel;

    if (this.panelInFocus === panel) {
      return;
    }
    if (panel && panel.firstElementChild) {
      const panelHasActiveDescendant =
        this.previousActiveDescendantElement &&
        panel.contains(this.previousActiveDescendantElement);
      const newValue = panelHasActiveDescendant
        ? this.previousActiveDescendantElement!
        : (panel.firstElementChild as HTMLElement);
      this.updateDescendants(newValue.id);
      //this.updateAriaLiveActiveDescendant(newValue);
    }
  }

  public clearSuggestions() {
    this.updateActiveDescendant();
    this.clearSuggestionElements();
  }

  public focusNextValue() {
    if (!this.hasSuggestions || !this.nextOrFirstValue) {
      return;
    }

    this.focusValue(this.nextOrFirstValue as HTMLElement);
  }

  public focusValue(value: HTMLElement) {
    this.updateActiveDescendant(value.id);
    this.scrollActiveDescendantIntoView();
    this.updateQueryFromSuggestion();
    //this.updateAriaLiveActiveDescendant(/*value*/);
  }

  public onSuggestionMouseOver(
    item: SearchBoxSuggestionElement,
    side: 'left' | 'right',
    id: string
  ) {
    const thisPanel = side === 'left' ? this.leftPanel : this.rightPanel;
    if (this.panelInFocus === thisPanel) {
      this.updateActiveDescendant(id);
    } else {
      this.updateDescendants(id);
    }
    if (item.query) {
      this.updateSuggestedQuery(item.query);
    }
  }

  public onSuggestionClick(item: SearchBoxSuggestionElement, e: Event) {
    item.onSelect && item.onSelect(e);
    item.query && this.clearSuggestions();
  }

  public get hasSuggestions() {
    return !!this.allSuggestionElements.length;
  }

  public get allSuggestionElements() {
    return [...this.leftSuggestionElements, ...this.rightSuggestionElements];
  }

  public focusPreviousValue() {
    if (this.firstValue === this.activeDescendantElement) {
      this.updateActiveDescendant();
      return;
    }

    if (!this.hasSuggestions || !this.previousOrLastValue) {
      return;
    }

    this.focusValue(this.previousOrLastValue as HTMLElement);
  }

  private get lastValue() {
    return this.panelInFocus?.lastElementChild;
  }

  private get previousOrLastValue() {
    if (!this.hasActiveDescendant) {
      return this.lastValue;
    }

    return (
      this.activeDescendantElement?.previousElementSibling || this.lastValue
    );
  }

  private sortSuggestions(a: SearchBoxSuggestions, b: SearchBoxSuggestions) {
    return a.position - b.position;
  }

  private get hasActiveDescendant() {
    return this.activeDescendant !== '';
  }

  private get nextOrFirstValue() {
    if (!this.hasActiveDescendant) {
      return this.firstValue;
    }

    return this.activeDescendantElement?.nextElementSibling || this.firstValue;
  }

  private get firstValue() {
    return this.panelInFocus?.firstElementChild;
  }

  private get panelInFocus() {
    if (this.leftPanel?.contains(this.activeDescendantElement)) {
      return this.leftPanel;
    }
    if (this.rightPanel?.contains(this.activeDescendantElement)) {
      return this.rightPanel;
    }
    return this.leftPanel || this.rightPanel;
  }

  private scrollActiveDescendantIntoView() {
    this.activeDescendantElement?.scrollIntoView({
      block: 'nearest',
    });
  }

  private updateQueryFromSuggestion() {
    const suggestedQuery = this.activeDescendantElement?.getAttribute(
      this.queryDataAttribute
    );
    if (
      suggestedQuery &&
      this.ownerSearchBoxProps.getSearchBoxValue() !== suggestedQuery
    ) {
      this.ownerSearchBoxProps.updateQuery(suggestedQuery);
      this.updateSuggestedQuery(suggestedQuery);
    }
  }

  private async updateSuggestedQuery(suggestedQuery: string) {
    const query = this.getIsMobile() ? '' : suggestedQuery;
    await Promise.allSettled(
      this.suggestions.map((suggestion) =>
        promiseTimeout(
          suggestion.onSuggestedQueryChange
            ? suggestion.onSuggestedQueryChange(query)
            : Promise.resolve(),
          this.ownerSearchBoxProps.getSuggestionTimeout()
        )
      )
    );
    this.suggestedQuery = query;
    this.updateSuggestionElements(query);
  }

  private updateSuggestionElements(query: string) {
    if (!this.isPanelInFocus(this.leftPanel, query)) {
      this.leftSuggestionElements = this.getAndFilterLeftSuggestionElements();
    }

    if (!this.isPanelInFocus(this.rightPanel, query)) {
      this.rightSuggestionElements = this.getSuggestionElements(
        this.rightSuggestions
      );
    }
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
      return !!panel?.querySelector(
        `[${this.queryDataAttribute}="${escaped}"]`
      );
    }

    return this.activeDescendantElement?.closest('ul') === panel;
  }

  private getAndFilterLeftSuggestionElements() {
    const suggestionElements = this.getSuggestionElements(this.leftSuggestions);
    const filterOnDuplicate = new Set();

    return suggestionElements.filter((suggestionElement) => {
      if (isNullOrUndefined(suggestionElement.query)) {
        return true;
      }
      if (filterOnDuplicate.has(suggestionElement.query)) {
        return false;
      } else {
        filterOnDuplicate.add(suggestionElement.query);
        return true;
      }
    });
  }

  private getSuggestionElements(suggestions: SearchBoxSuggestions[]) {
    const elements = suggestions
      .map((suggestion) => suggestion.renderItems())
      .flat();

    const max =
      this.ownerSearchBoxProps.getNumberOfSuggestionsToDisplay() +
      elements.filter(elementHasNoQuery).length;

    return elements.slice(0, max);
  }

  private updateDescendants(activeDescendant = '') {
    const newPrevDescendantElement = this.activeDescendantElement;
    this.activeDescendant = activeDescendant;
    this.previousActiveDescendantElement = newPrevDescendantElement;
  }

  private clearSuggestionElements() {
    this.leftSuggestionElements = [];
    this.rightSuggestionElements = [];
    //this.searchBoxAriaMessage = '';
  }
}
