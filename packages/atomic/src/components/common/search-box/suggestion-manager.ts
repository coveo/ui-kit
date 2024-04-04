import {isNullOrUndefined} from '@coveo/bueno';
import {VNode} from '@stencil/core';
import {promiseTimeout} from '../../../utils/promise-utils';
import {elementHasNoQuery} from '../../search/search-box-suggestions/suggestions-common';

const queryDataAttribute = 'data-query';

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

export class SuggestionManager {
  private queryDataAttribute = 'data-query';
  private suggestions: SearchBoxSuggestions[] = [];
  private suggestedQuery = '';

  private activeDescendant = '';
  private activeDescendantElement: HTMLElement | null = null;
  private previousActiveDescendantElement: HTMLElement | null = null;
  private leftSuggestions: SearchBoxSuggestions[] = [];
  private leftSuggestionElements: SearchBoxSuggestionElement[] = [];
  private rightSuggestions: SearchBoxSuggestions[] = [];
  private rightSuggestionElements: SearchBoxSuggestionElement[] = [];
  private leftPanel: HTMLElement | null = null;
  private rightPanel: HTMLElement | null = null;

  constructor(
    private getSearchBoxValue: () => string,
    private updateQuery: (suggestedQuery: string) => void,
    private getIsMobile: () => boolean,
    private getSuggestionTimeout: () => number,
    private getNumberOfSuggestionsToDisplay: () => number
  ) {}

  public clearSuggestions() {}
  public focusNextValue() {
    if (!this.hasSuggestions || !this.nextOrFirstValue) {
      return;
    }

    this.focusValue(this.nextOrFirstValue as HTMLElement);
  }

  private get allSuggestionElements() {
    return [...this.leftSuggestionElements, ...this.rightSuggestionElements];
  }

  private get hasSuggestions() {
    return !!this.allSuggestionElements.length;
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

  private focusValue(value: HTMLElement) {
    this.activeDescendant = value.id;
    this.scrollActiveDescendantIntoView();
    this.updateQueryFromSuggestion();
    this.updateAriaLiveActiveDescendant(/*value*/);
  }

  private scrollActiveDescendantIntoView() {
    this.activeDescendantElement?.scrollIntoView({
      block: 'nearest',
    });
  }

  private updateAriaLiveActiveDescendant(/*value: HTMLElement*/) {
    /*if (isMacOS()) {
      this.suggestionsAriaMessage = value.ariaLabel!;
    }*/
  }

  private updateQueryFromSuggestion() {
    const suggestedQuery =
      this.activeDescendantElement?.getAttribute(queryDataAttribute);
    if (suggestedQuery && this.getSearchBoxValue() !== suggestedQuery) {
      this.updateQuery(suggestedQuery);
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
          this.getSuggestionTimeout()
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

  private isPanelInFocus(panel: HTMLElement | null, query: string): boolean {
    if (!this.activeDescendantElement) {
      return false;
    }

    if (query) {
      const escaped = query.replace(/"/g, '\\"');
      return !!panel?.querySelector(`[${queryDataAttribute}="${escaped}"]`);
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
      this.getNumberOfSuggestionsToDisplay() +
      elements.filter(elementHasNoQuery).length;

    return elements.slice(0, max);
  }
}
