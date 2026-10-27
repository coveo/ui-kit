export interface SuggestionItem {
  id: string;
  label: string;
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
