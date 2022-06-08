import {SearchBox} from '@coveo/headless';
import {VNode} from '@stencil/core';
import {buildCustomEvent} from '../../utils/event-utils';
import {Bindings} from '../../utils/initialization-utils';
import {closest} from '../../utils/utils';

export interface SearchBoxDividerElement {
  key: string;
  content: Element | VNode;
  onSelect?(): void;
}

export interface SearchBoxSuggestionElement {
  key: string;
  query: string;
  content: Element | VNode;
  onSelect(): void;
}

export type SearchBoxSuggestionItem =
  | SearchBoxDividerElement
  | SearchBoxSuggestionElement;

export interface SearchBoxSuggestions {
  position: number;
  panel?: 'left' | 'right';
  renderItems(): SearchBoxSuggestionItem[];
  onInput?(): Promise<unknown> | void;
  onSuggestedQueryChange?(q: string): Promise<unknown> | void;
}

export type SearchBoxSuggestionsEvent = (
  bindings: SearchBoxSuggestionsBindings
) => SearchBoxSuggestions;

export interface SearchBoxSuggestionsBindings extends Bindings {
  id: string;
  isStandalone: boolean;
  searchBoxController: SearchBox;
  numberOfQueries: number;
  suggestedQuery(): string;
  clearSuggestions(): void;
  triggerSuggestions(): void;
  getSuggestions(): SearchBoxSuggestions[];
}

export const dispatchSearchBoxSuggestionsEvent = (
  event: SearchBoxSuggestionsEvent,
  element: HTMLElement
) => {
  element.dispatchEvent(
    buildCustomEvent('atomic/searchBoxSuggestion/register', event)
  );

  const hasParentSearchBox = closest(element, 'atomic-search-box');

  if (!hasParentSearchBox) {
    throw new Error(
      `The "${element.nodeName.toLowerCase()}" component was not handled, as it is not a child of an "atomic-search-box" component`
    );
  }
};

export function isSuggestionElement(
  el: SearchBoxSuggestionItem
): el is SearchBoxSuggestionElement {
  return 'query' in el;
}

export function isDividerElement(
  el: SearchBoxSuggestionItem
): el is SearchBoxDividerElement {
  return !('query' in el);
}

export const queryDataAttribute = 'data-query';
