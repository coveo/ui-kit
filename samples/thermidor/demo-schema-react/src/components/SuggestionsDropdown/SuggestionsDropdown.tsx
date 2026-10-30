import type {ReactNode} from 'react';
import type {SuggestionSection, SuggestionItem, SuggestionsPlacement} from './types.js';
import {SuggestionSectionGroup} from './SuggestionSectionGroup.js';
import styles from './SuggestionsDropdown.module.css';

export const SUGGESTIONS_LISTBOX_ID = 'suggestions-listbox';

interface SuggestionsDropdownProps {
  sections: SuggestionSection[];
  onSelect: (item: SuggestionItem, sectionId: string) => void;
  /** Called with the item the pointer moves onto. */
  onHover?: (item: SuggestionItem) => void;
  visible: boolean;
  activeIndex?: number;
  /** Where the dropdown opens, relative to its input. Defaults to below. */
  placement?: SuggestionsPlacement;
  /** Drawn beside the suggestions, outside their listbox, such as products for the highlight. */
  aside?: ReactNode;
}

export function SuggestionsDropdown({
  sections,
  onSelect,
  onHover,
  visible,
  activeIndex,
  placement = 'below',
  aside,
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

  return (
    <div className={`${styles.dropdown} ${placement === 'above' ? styles.above : ''}`}>
      <div
        id={SUGGESTIONS_LISTBOX_ID}
        role="listbox"
        aria-label="Query suggestions"
        className={styles.listbox}
      >
        <div className={styles.dropdownHeader}>
          <span className={styles.dropdownHeaderTitle}>Query suggestions</span>
        </div>
        {sections.map((section) => (
          <SuggestionSectionGroup
            key={section.id}
            section={section}
            onSelect={(item) => onSelect(item, section.id)}
            onHover={onHover}
            activeItemId={activeItemId}
          />
        ))}
      </div>
      {aside}
    </div>
  );
}
