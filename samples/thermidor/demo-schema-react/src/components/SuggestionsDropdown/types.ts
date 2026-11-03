export interface SuggestionItem {
  id: string;
  label: string;
  /** Bolded wherever it starts a word in `label`. */
  highlight?: string;
  subtitle?: string;
}

export type SuggestionIconType = 'search' | 'sparkle' | 'settings';

export interface SuggestionSection {
  id: string;
  title: string;
  icon: SuggestionIconType;
  items: SuggestionItem[];
}

export type SuggestionsPlacement = 'below' | 'above';

/** An item drawn beside the suggestions that the arrow keys reach, such as an instant product. */
export interface AsideItem {
  /** The id of the item's element, which the input names as its active descendant. */
  id: string;
  onSelect: () => void;
}
