import {createContext, type ReactNode} from 'react';
import type {SuggestionSection, SuggestionItem, SuggestionsPlacement} from './types.js';
import {SuggestionSectionGroup} from './SuggestionSectionGroup.js';
import {suggestionOptions} from './options.js';
import styles from './SuggestionsDropdown.module.css';

export const SUGGESTIONS_LISTBOX_ID = 'suggestions-listbox';
/** The listbox drawn beside the suggestions, whose options the left and right arrows reach. */
export const ASIDE_LISTBOX_ID = 'suggestions-aside-listbox';
export const ActiveAsideOptionContext = createContext<string | undefined>(undefined);

interface SuggestionsDropdownProps {
  sections: SuggestionSection[];
  onSelect: (item: SuggestionItem, sectionId: string) => void;
  /** Called with the item the pointer moves onto. */
  onHover?: (item: SuggestionItem) => void;
  /** Called with the item whose remove button is pressed, instead of its section's `removal`. */
  onRemove?: (item: SuggestionItem) => void;
  visible: boolean;
  /** The index of the highlighted option, among the items and section actions. */
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
  onRemove,
  visible,
  activeIndex,
  placement = 'below',
  aside,
}: SuggestionsDropdownProps) {
  if (!visible || sections.length === 0) {
    return null;
  }

  const activeOptionId =
    activeIndex !== undefined && activeIndex >= 0
      ? suggestionOptions(sections)[activeIndex]?.id
      : undefined;

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
        {sections.map((section) => (
          <SuggestionSectionGroup
            key={section.id}
            section={section}
            onSelect={(item) => onSelect(item, section.id)}
            onHover={onHover}
            onRemove={onRemove}
            activeOptionId={activeOptionId}
          />
        ))}
      </div>
      {aside}
    </div>
  );
}
