import type {SuggestionSection, SuggestionItem} from './types.js';
import {SuggestionSectionGroup} from './SuggestionSectionGroup.js';
import styles from './SuggestionsDropdown.module.css';

export const SUGGESTIONS_LISTBOX_ID = 'suggestions-listbox';

interface SuggestionsDropdownProps {
  sections: SuggestionSection[];
  onSelect: (item: SuggestionItem, sectionId: string) => void;
  visible: boolean;
  activeIndex?: number;
  inputValue?: string;
}

export function SuggestionsDropdown({
  sections,
  onSelect,
  visible,
  activeIndex,
}: SuggestionsDropdownProps) {
  if (!visible || sections.length === 0) {
    return null;
  }

  let activeItemId: string | undefined;
  if (activeIndex !== undefined && activeIndex >= 0) {
    const allItems = sections.flatMap((section) => section.items);
    const activeItem = allItems[activeIndex];
    if (activeItem) {
      activeItemId = activeItem.id;
    }
  }

  let runningIndex = 0;

  return (
    <div
      id={SUGGESTIONS_LISTBOX_ID}
      role="listbox"
      aria-label="Query suggestions"
      className={styles.dropdown}
    >
      <div className={styles.dropdownHeader}>
        <span className={styles.dropdownHeaderTitle}>Query suggestions</span>
      </div>
      {sections.map((section) => {
        const startIndex = runningIndex;
        runningIndex += section.items.length;

        return (
          <SuggestionSectionGroup
            key={section.id}
            section={section}
            onSelect={(item) => onSelect(item, section.id)}
            activeItemId={activeItemId}
            startIndex={startIndex}
          />
        );
      })}
    </div>
  );
}
