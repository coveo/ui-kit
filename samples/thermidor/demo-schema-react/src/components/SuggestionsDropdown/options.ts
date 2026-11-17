import type {SuggestionItem, SuggestionSection, SuggestionSectionAction} from './types.js';

/** An option of the suggestions listbox, by its element id: an item, or a section's action. */
export type SuggestionOption =
  | {id: string; item: SuggestionItem; action?: never}
  | {id: string; action: SuggestionSectionAction; item?: never};

export const itemOptionId = (item: SuggestionItem) => `suggestion-item-${item.id}`;
export const actionOptionId = (section: SuggestionSection) => `section-${section.id}-action`;

/** The options of `sections`, in the order the arrow keys reach them. */
export function suggestionOptions(sections: readonly SuggestionSection[]): SuggestionOption[] {
  return sections.flatMap((section): SuggestionOption[] => [
    ...(section.action ? [{id: actionOptionId(section), action: section.action}] : []),
    ...section.items.map((item) => ({id: itemOptionId(item), item})),
  ]);
}
