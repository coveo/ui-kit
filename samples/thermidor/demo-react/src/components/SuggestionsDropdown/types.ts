export interface SuggestionItem {
  id: string;
  label: string;
  subtitle?: string;
}

export type SuggestionIconType = 'search' | 'sparkle' | 'filter-sparkle';

export interface SuggestionSection {
  id: string;
  title: string;
  icon: SuggestionIconType;
  items: SuggestionItem[];
}

export type SuggestionActionType = 'submit' | 'toast';

export const SECTION_ACTIONS: Record<string, SuggestionActionType> = {
  search: 'submit',
  conversational: 'submit',
  refinements: 'toast',
};
