import type {ReactNode} from 'react';
import type {SuggestionSection, SuggestionItem, SuggestionsPlacement} from './types.js';
import {SuggestionSectionGroup} from './SuggestionSectionGroup.js';
import styles from './SuggestionsDropdown.module.css';

export const SUGGESTIONS_LISTBOX_ID = 'suggestions-listbox';
/** The id of the listbox drawn beside the suggestions, such as the instant products. */
export const ASIDE_LISTBOX_ID = 'suggestions-aside-listbox';

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
  /** Whether the arrow keys can reach a list beside the suggestions, which their labels then say. */
  doubleList?: boolean;
}

export function SuggestionsDropdown({
  sections,
  onSelect,
  onHover,
  visible,
  activeIndex,
  placement = 'below',
  aside,
  doubleList = false,
}: SuggestionsDropdownProps) {
  if (!visible || sections.length === 0) {
    return null;
  }

  const allItems = sections.flatMap((section) => section.items);
  const activeItemId =
    activeIndex !== undefined && activeIndex >= 0 ? allItems[activeIndex]?.id : undefined;

  return (
    <div
      className={`${styles.dropdown} ${placement === 'above' ? styles.above : ''}`}
      // Keeps the focus in the input, whose blur would close the dropdown before a click lands.
      onMouseDown={(event) => event.preventDefault()}
    >
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
            positionOf={(item) => allItems.indexOf(item) + 1}
            count={allItems.length}
            list={doubleList ? 'Left' : undefined}
          />
        ))}
      </div>
      {aside}
    </div>
  );
}
