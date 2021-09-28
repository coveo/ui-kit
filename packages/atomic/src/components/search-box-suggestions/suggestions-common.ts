import {SearchBox} from '@coveo/headless';
import {VNode} from '@stencil/core';
import {buildCustomEvent} from '../../utils/event-utils';
import {Bindings} from '../../utils/initialization-utils';

export interface SearchBoxSuggestionElement {
  value: string;
  onClick(): void;
  content: VNode;
}

export interface SearchBoxSuggestions {
  // TODO: add query context onInput
  // TODO: add position (priority in the list)
  onInput(): Promise<unknown> | void;
  renderItems(): SearchBoxSuggestionElement[];
}

export type SearchBoxSuggestionsEvent = (
  bindings: SearchBoxSuggestionsBindings
) => SearchBoxSuggestions;

export interface SearchBoxSuggestionsBindings extends Bindings {
  id: string;
  searchBoxController: SearchBox;
  numberOfQueries: number;
}

export const dispatchSearchBoxSuggestionsEvent = (
  event: SearchBoxSuggestionsEvent,
  element: Element
) => {
  const canceled = element.dispatchEvent(
    buildCustomEvent('atomic/searchBoxSuggestion', event)
  );
  if (canceled) {
    throw new Error(
      'The Atomic search box suggestion component was not handled, as it is not a child of a search box component'
    );
  }
};
