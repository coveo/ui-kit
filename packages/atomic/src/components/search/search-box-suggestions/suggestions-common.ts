import {SearchBox} from '@coveo/headless';
import {VNode} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {closest} from '../../../utils/utils';
import {SearchBindings} from '../atomic-search-interface/atomic-search-interface';
export interface SearchBoxSuggestionElement {
  key: string;
  content: Element | VNode;
  onSelect?(e: Event): void;

  query?: string;
  part?: string;
  hideIfLast?: boolean;
}
export interface SearchBoxSuggestions {
  position: number;
  panel?: 'left' | 'right';
  renderItems(): SearchBoxSuggestionElement[];
  onInput?(): Promise<unknown> | void;
  onSuggestedQueryChange?(q: string): Promise<unknown> | void;
}

export type SearchBoxSuggestionsEvent = (
  bindings: SearchBoxSuggestionsBindings
) => SearchBoxSuggestions;

export interface SearchBoxSuggestionsBindings extends SearchBindings {
  id: string;
  isStandalone: boolean;
  searchBoxController: SearchBox;
  numberOfQueries: number;
  suggestedQuery(): string;
  clearSuggestions(): void;
  triggerSuggestions(): void;
  getSuggestions(): SearchBoxSuggestions[];
  getSuggestionElements(): SearchBoxSuggestionElement[];
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

export function elementHasNoQuery(el: SearchBoxSuggestionElement) {
  return !el.query;
}

export function elementHasQuery(el: SearchBoxSuggestionElement) {
  return !!el.query;
}
export const queryDataAttribute = 'data-query';
