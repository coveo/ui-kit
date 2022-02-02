import {SearchBox} from '@coveo/headless';
import {VNode} from '@stencil/core';
import {buildCustomEvent} from '../../utils/event-utils';
import {Bindings} from '../../utils/initialization-utils';

export interface SearchBoxSuggestionElement {
  key: string;
  query?: string;
  onSelect(): void;
  content: VNode;
}

export interface SearchBoxSuggestions {
  position: number;
  onInput(): Promise<unknown> | void;
  renderItems(): SearchBoxSuggestionElement[];
}

export type SearchBoxSuggestionsEvent = (
  bindings: SearchBoxSuggestionsBindings
) => SearchBoxSuggestions;

export interface SearchBoxSuggestionsBindings extends Bindings {
  id: string;
  isStandalone: boolean;
  searchBoxController: SearchBox;
  numberOfQueries: number;
  clearSuggestions(): void;
  triggerSuggestions(): void;
  getSuggestions: () => SearchBoxSuggestions[];
}

export const dispatchSearchBoxSuggestionsEvent = (
  event: SearchBoxSuggestionsEvent,
  element: Element
) => {
  const canceled = element.dispatchEvent(
    buildCustomEvent('atomic/searchBoxSuggestion/register', event)
  );
  if (canceled) {
    throw new Error(
      `The "${element.nodeName.toLowerCase()}" component was not handled, as it is not a child of an "atomic-search-box" component`
    );
  }
};
