export interface SuggestionItem {
  id: string;
  label: string;
  /** Bolded wherever it starts a word in `label`. */
  highlight?: string;
  /** Bolds what follows it in `label`, when `label` starts with it. */
  completes?: string;
  subtitle?: string;
}

export type SuggestionIconType = 'search' | 'sparkle' | 'settings' | 'history';

/** A control drawn in a section's header, such as one clearing its items. */
export interface SuggestionSectionAction {
  label: string;
  ariaLabel: string;
  onClick: () => void;
}

/** Removes one item, with its remove button or with Shift+Delete while it is highlighted. */
export interface SuggestionRemoval {
  /** The accessible name of the item's remove button. */
  ariaLabel: (item: SuggestionItem) => string;
  onRemove: (item: SuggestionItem) => void;
}

export interface SuggestionSection {
  id: string;
  title: string;
  icon: SuggestionIconType;
  items: SuggestionItem[];
  action?: SuggestionSectionAction;
  removal?: SuggestionRemoval;
}

export type SuggestionsPlacement = 'below' | 'above';
