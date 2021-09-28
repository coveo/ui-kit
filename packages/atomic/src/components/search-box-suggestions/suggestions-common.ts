import {SearchBox} from '@coveo/headless';
import {VNode} from '@stencil/core';
import {Bindings} from '../../utils/initialization-utils';

export interface SearchBoxSuggestionElement {
  value: string;
  onClick(): void;
  content: VNode;
}

export interface SearchBoxSuggestions {
  onInput(): Promise<unknown> | void;
  renderItems(): SearchBoxSuggestionElement[];
}

export type SearchBoxSuggestionsEvent = (
  bindings: SearchBoxSuggestionsBindings
) => SearchBoxSuggestions;

export interface SearchBoxSuggestionsBindings extends Bindings {
  id: string;
  searchBoxController: SearchBox;
}
