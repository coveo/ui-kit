import {isNullOrUndefined} from '@coveo/bueno';
import DOMPurify from 'dompurify';
import type {LitElement} from 'lit';
import {debounce} from '../../../utils/debounce-utils';
import {promiseTimeout} from '../../../utils/promise-utils';
import type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from './suggestions-types';
import {elementHasNoQuery, elementHasQuery} from './suggestions-utils';

/**
 * List of suggestions that will be displayed along other lists (for example, recent queries) when the search box's input is selected.
 */
export interface SearchBoxSuggestions {
  /**
   * The search box will sort the position of suggestions using this value, the lowest value being first.
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
  onInput?(): Promise<unknown>;
  /**
   * Hook called when the current suggested query changes as the user navigates the list of suggestions.
   * This is used for instant results, which are rendered based on the current suggested query.
   * @param q The new current suggested query.
   */
  onSuggestedQueryChange?(q: string): Promise<unknown>;
}

interface SearchBoxProps {
  getSearchBoxValue: () => string;
  updateQuery: (suggestedQuery: string) => void;
  getSuggestionTimeout: () => number;
  getNumberOfSuggestionsToDisplay: () => number;
  getSuggestionDelay: () => number;
  getLogger: () => Pick<typeof console, 'warn'>;
  getHost: () => LitElement;
}

export class SuggestionManager<SearchBoxController> {
  public suggestions: SearchBoxSuggestions[] = [];
  public leftSuggestionElements: SearchBoxSuggestionElement[] = [];
  public rightSuggestionElements: SearchBoxSuggestionElement[] = [];
  public leftPanel: HTMLElement | undefined = undefined;
  public rightPanel: HTMLElement | undefined = undefined;
  public triggerSuggestions: () => Promise<void>;
  public activeDescendant = '';
  public suggestedQuery = '';
  public keyboardActiveDescendant = '';

  private queryDataAttribute = 'data-query';
  private suggestionEvents: SearchBoxSuggestionsEvent<SearchBoxController>[] =
    [];

  private previousActiveDescendantElement: HTMLElement | null = null;
  private leftSuggestions: SearchBoxSuggestions[] = [];
  private rightSuggestions: SearchBoxSuggestions[] = [];

  constructor(private ownerSearchBoxProps: SearchBoxProps) {
    this.triggerSuggestions = debounce(
      () => this.executeQuerySuggestion(),
      this.ownerSearchBoxProps.getSuggestionDelay()
    );
  }

  public get partialSuggestionBindings(): Pick<
    SearchBoxSuggestionsBindings<SearchBoxController>,
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
      this.rightPanel?.querySelector(`#${this.activeDescendant}`) ||
      null
    );
  }

  public onSubmit() {
    this.clickOnActiveElement();
    this.clearSuggestions();
  }

  public updateActiveDescendant(id = '') {
    this.activeDescendant = id;
    this.ownerSearchBoxProps.getHost().requestUpdate();
  }

  public updateKeyboardActiveDescendant(id = '') {
    this.keyboardActiveDescendant = id;
  }

  public clickOnActiveElement() {
    this.activeDescendantElement?.click();
    this.updateActiveDescendant();
  }

  public isRightPanelInFocus() {
    if (
      isNullOrUndefined(this.panelInFocus) ||
      isNullOrUndefined(this.rightPanel)
    ) {
      return false;
    }

    return this.panelInFocus === this.rightPanel;
  }

  public initializeSuggestions(
    bindings: SearchBoxSuggestionsBindings<SearchBoxController>
  ) {
    this.suggestions = this.suggestionEvents.map((event) => event(bindings));
  }

  public registerSuggestionsFromEvent(
    event: CustomEvent<SearchBoxSuggestionsEvent<SearchBoxController>>,
    bindings: SearchBoxSuggestionsBindings<SearchBoxController>
  ) {
    event.preventDefault();
    event.stopPropagation();
    this.suggestionEvents.push(event.detail);
    this.suggestions.push(event.detail(bindings));
  }

  public registerSuggestions(suggestions: SearchBoxSuggestions) {
    this.suggestions.push(suggestions);
  }

  public get isDoubleList() {
    return Boolean(
      this.leftSuggestionElements.length && this.rightSuggestionElements.length
    );
  }

  public focusPanel(side: 'left' | 'right') {
    const panel = side === 'left' ? this.leftPanel : this.rightPanel;

    if (this.panelInFocus === panel) {
      return;
    }
    if (panel?.firstElementChild) {
      const panelHasActiveDescendant =
        this.previousActiveDescendantElement &&
        panel.contains(this.previousActiveDescendantElement);
      const newValue = panelHasActiveDescendant
        ? this.previousActiveDescendantElement!
        : (panel.firstElementChild as HTMLElement);
      this.updateDescendants(newValue.id);
    }
  }

  public clearSuggestions() {
    this.clearSuggestionElements();
    this.updateActiveDescendant();
  }

  public async focusNextValue() {
    if (!this.hasSuggestions || !this.nextOrFirstValue) {
      return;
    }

    await this.focusValue(this.nextOrFirstValue as HTMLElement);
  }

  public async focusValue(value: HTMLElement) {
    this.updateKeyboardActiveDescendant(value.id);
    this.updateActiveDescendant(value.id);
    this.scrollActiveDescendantIntoView();
    await this.updateQueryFromSuggestion();
  }

  public async onSuggestionMouseOver(
    item: SearchBoxSuggestionElement,
    side: 'left' | 'right',
    id: string
  ) {
    const thisPanel = side === 'left' ? this.leftPanel : this.rightPanel;
    // When hovering, always reset the keyboard active descendant
    this.updateKeyboardActiveDescendant();
    if (this.panelInFocus === thisPanel) {
      this.updateActiveDescendant(id);
    } else {
      this.updateDescendants(id);
    }
    if (item.query) {
      await this.updateSuggestedQuery(item.query);
    }
  }

  public async onSuggestionClick(item: SearchBoxSuggestionElement, e: Event) {
    if (item.query) {
      this.clearSuggestions();
      await this.updateOwnerSearchboxQuery(item.query);
    }
    item.onSelect?.(e);
  }

  public get hasSuggestions() {
    return !!this.allSuggestionElements.length;
  }

  public get allSuggestionElements() {
    return [...this.leftSuggestionElements, ...this.rightSuggestionElements];
  }

  public async focusPreviousValue() {
    if (this.firstValue === this.activeDescendantElement) {
      this.updateKeyboardActiveDescendant();
      this.updateActiveDescendant();
      return;
    }

    if (!this.hasSuggestions || !this.previousOrLastValue) {
      return;
    }

    await this.focusValue(this.previousOrLastValue as HTMLElement);
  }

  public get hasActiveDescendant() {
    return this.activeDescendant !== '';
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
        this.ownerSearchBoxProps
          .getLogger()
          .warn(
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

    await this.updateSuggestedQuery(defaultSuggestedQuery);
  }

  private get lastValue() {
    return this.panelInFocus?.lastElementChild;
  }

  private get previousOrLastValue() {
    if (!this.hasActiveDescendant) {
      return this.lastValue?.firstChild;
    }

    const parentOfActiveDescendant =
      this.activeDescendantElement?.parentElement;

    return (
      parentOfActiveDescendant?.previousElementSibling?.firstChild ||
      this.firstValue?.firstChild
    );
  }

  private sortSuggestions(a: SearchBoxSuggestions, b: SearchBoxSuggestions) {
    return a.position - b.position;
  }

  private get nextOrFirstValue() {
    if (!this.hasActiveDescendant) {
      return this.firstValue?.firstChild;
    }

    const parentOfActiveDescendant =
      this.activeDescendantElement?.parentElement;
    return (
      parentOfActiveDescendant?.nextElementSibling?.firstChild ||
      this.firstValue?.firstChild
    );
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

  private async updateQueryFromSuggestion() {
    const suggestedQuery = this.activeDescendantElement?.getAttribute(
      this.queryDataAttribute
    );
    await this.updateOwnerSearchboxQuery(suggestedQuery || '');
  }

  private async updateOwnerSearchboxQuery(query: string) {
    if (query && this.ownerSearchBoxProps.getSearchBoxValue() !== query) {
      this.ownerSearchBoxProps.updateQuery(query);
      await this.updateSuggestedQuery(query);
    }
  }

  private async updateSuggestedQuery(suggestedQuery: string) {
    await Promise.allSettled(
      this.suggestions.map((suggestion) =>
        promiseTimeout(
          suggestion.onSuggestedQueryChange
            ? suggestion.onSuggestedQueryChange(suggestedQuery)
            : Promise.resolve(),
          this.ownerSearchBoxProps.getSuggestionTimeout()
        )
      )
    );
    this.suggestedQuery = suggestedQuery;
    this.updateSuggestionElements(suggestedQuery);
    this.ownerSearchBoxProps.getHost().requestUpdate();
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

  public forceUpdate() {
    this.updateSuggestionElements(this.suggestedQuery);
    this.ownerSearchBoxProps.getHost().requestUpdate();
  }

  private isPanelInFocus(
    panel: HTMLElement | undefined,
    query: string
  ): boolean {
    if (!this.activeDescendantElement) {
      return false;
    }

    if (query) {
      const escaped = DOMPurify.sanitize(query);
      return !!panel?.querySelector(
        `[${this.queryDataAttribute}="${CSS.escape(escaped)}"]`
      );
    }

    return this.activeDescendantElement?.closest('ul') === panel;
  }

  private getAndFilterLeftSuggestionElements() {
    const suggestionElements = this.getSuggestionElements(this.leftSuggestions);
    const filterOnDuplicate = new Set();

    const out = suggestionElements.filter((suggestionElement) => {
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

    return out;
  }

  private getSuggestionElements(suggestions: SearchBoxSuggestions[]) {
    const elements = suggestions.flatMap((suggestion) =>
      suggestion.renderItems()
    );

    const max =
      this.ownerSearchBoxProps.getNumberOfSuggestionsToDisplay() +
      elements.filter(elementHasNoQuery).length;

    return elements.slice(0, max);
  }

  private updateDescendants(activeDescendant = '') {
    const newPrevDescendantElement = this.activeDescendantElement;
    this.previousActiveDescendantElement = newPrevDescendantElement;
    this.updateActiveDescendant(activeDescendant);
  }

  private clearSuggestionElements() {
    this.leftSuggestionElements = [];
    this.rightSuggestionElements = [];
  }
}
