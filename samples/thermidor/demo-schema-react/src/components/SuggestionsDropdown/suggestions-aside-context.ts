import {createContext, useContext} from 'react';
import type {AsideItem} from './types.js';

/** What the input gives what is drawn beside its suggestions, so the arrow keys can reach it. */
export interface SuggestionsAside {
  /** The id of the aside item the shopper highlights, if any. */
  activeItemId?: string;
  /** Makes these items reachable with the arrow keys, in order. */
  showItems: (items: AsideItem[]) => void;
  hoverItem: (item: AsideItem) => void;
  selectItem: (item: AsideItem) => void;
}

export const SuggestionsAsideContext = createContext<SuggestionsAside | null>(null);

export function useSuggestionsAside(): SuggestionsAside {
  const aside = useContext(SuggestionsAsideContext);
  if (!aside) {
    throw new Error('useSuggestionsAside must be used beside the suggestions of a PromptInput');
  }
  return aside;
}
