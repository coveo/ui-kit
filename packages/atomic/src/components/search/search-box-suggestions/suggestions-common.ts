import {SearchBox} from '@coveo/headless';
import {VNode} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {closest} from '../../../utils/utils';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

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
   * The position of the list of the suggestions relative to the others.
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
   * Hook called when the suggested query changes. As a user traverses through the list of suggestions, instant results can be rendered based on the current suggested query.
   * @param q The new suggested query.
   */
  onSuggestedQueryChange?(q: string): Promise<unknown> | void;
}

/**
 * Event sent from the registered query suggestions to the parent search box.
 */
export type SearchBoxSuggestionsEvent = (
  /**
   * The bindings passed from the search box to the suggestions.
   */
  bindings: SearchBoxSuggestionsBindings
) => SearchBoxSuggestions;

const searchBoxElements = ['atomic-search-box', 'atomic-insight-search-box'];

/**
 * The bindings passed from the search box to the suggestions.
 */
export interface SearchBoxSuggestionsBindings extends Bindings {
  /**
   * The unique id of the search box.
   */
  id: string;
  /**
   * Whether the search box is standalone.
   */
  isStandalone: boolean;
  /**
   * The SearchBox headless controller.
   */
  searchBoxController: SearchBox;
  /**
   * The amount of queries displayed when the user interacts with the search box.
   * By default, a mix of query suggestions and recent queries will be shown.
   */
  numberOfQueries: number;
  /**
   * Whether to clear all active query filters when the end user submits a new query from the search box.
   */
  clearFilters: boolean;
  /**
   * Retrieves the suggestion query, meaning the query that will be sent if the search is executed.
   */
  suggestedQuery(): string;
  /**
   * Removes the current suggestions.
   */
  clearSuggestions(): void;
  /**
   * Triggers the retrieval of updated suggestions.
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
}

/**
 * Dispatches an event which retrieves the `SearchBoxSuggestionsBindings` on a configured parent search box.
 * @param event Event sent from the registered query suggestions to the parent search box.
 * @param element Element on which to dispatch the event, which must be the child of a configured search box.
 */
export const dispatchSearchBoxSuggestionsEvent = (
  event: SearchBoxSuggestionsEvent,
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
