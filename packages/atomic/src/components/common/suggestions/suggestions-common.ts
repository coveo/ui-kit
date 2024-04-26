import {VNode} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {closest} from '../../../utils/utils';
import {AnyBindings} from '../interface/bindings';

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
   * Hook called when the suggestion is selected.
   * @param e DOM event.
   */
  onSelect?(e: Event): void;
  /**
   * The query associated with the suggestion which will replace the query in the search box if the suggestion is selected.
   */
  query?: string;
  /**
   * For improved accessibility, set this property with additional information.
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
   */
  ariaLabel?: string;
  /**
   * Adds a specific shadow part attribute that can be selected with the CSS ::part pseudo-element.
   * https://developer.mozilla.org/en-US/docs/Web/CSS/::part
   */
  part?: string;
  /**
   * Whether to hide the suggestion when it's the last one in the list.
   */
  hideIfLast?: boolean;
}

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

/**
 * Event sent from the registered query suggestions to the parent search box.
 */
export type SearchBoxSuggestionsEvent<
  SearchBoxController,
  Bindings = AnyBindings,
> = (
  /**
   * The bindings passed from the search box to the suggestions.
   */
  bindings: SearchBoxSuggestionsBindings<SearchBoxController, Bindings>
) => SearchBoxSuggestions;

const searchBoxElements = ['atomic-search-box', 'atomic-insight-search-box'];

/**
 * The bindings passed from the search box to the suggestions.
 */
export type SearchBoxSuggestionsBindings<
  SearchBoxController,
  Bindings = AnyBindings,
> = Bindings & {
  /**
   * The unique id of the search box.
   */
  id: string;
  /**
   * Whether the search box is [standalone](https://docs.coveo.com/en/atomic/latest/usage/ssb/).
   */
  isStandalone: boolean;
  /**
   * The search box headless controller.
   */
  searchBoxController: SearchBoxController;
  /**
   * The number of queries to display when the user interacts with the search box.
   */
  numberOfQueries: number;
  /**
   * Whether to clear all active query filters when the end user submits a new query from the search box.
   */
  clearFilters: boolean;
  /**
   * Retrieves the suggested query, meaning the query that would be sent if the search is executed.
   * The suggested query changes as a user traverses through the list of suggestions.
   */
  suggestedQuery(): string;
  /**
   * Removes the current suggestions.
   */
  clearSuggestions(): void;
  /**
   * Triggers update & retrieval of all suggestions.
   */
  triggerSuggestions(): void;
  /**
   * Retrieves the current suggestions.
   */
  getSuggestions(): SearchBoxSuggestions[];
  /**
   * Retrieves the current suggestions elements.
   */
  getSuggestionElements(): SearchBoxSuggestionElement[];
};

/**
 * Dispatches an event which retrieves the `SearchBoxSuggestionsBindings` on a configured parent search box.
 * @param event Event sent from the registered query suggestions to the parent search box.
 * @param element Element on which to dispatch the event, which must be the child of a configured search box.
 */
export const dispatchSearchBoxSuggestionsEvent = <
  SearchBoxController,
  Bindings = AnyBindings,
>(
  event: SearchBoxSuggestionsEvent<SearchBoxController, Bindings>,
  element: HTMLElement
) => {
  element.dispatchEvent(
    buildCustomEvent('atomic/searchBoxSuggestion/register', event)
  );

  if (!closest(element, searchBoxElements.join(', '))) {
    throw new Error(
      `The "${element.nodeName.toLowerCase()}" component was not handled, as it is not a child of the following elements: ${searchBoxElements.join(
        ', '
      )}`
    );
  }
};

export function elementHasNoQuery(el: SearchBoxSuggestionElement) {
  return !el.query;
}

export function elementHasQuery(el: SearchBoxSuggestionElement) {
  return !!el.query;
}
