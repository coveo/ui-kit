import type {SuggestionSection, SuggestionItem} from './types.js';
import {SuggestionItemRow} from './SuggestionItemRow.js';
import styles from './SuggestionSectionGroup.module.css';

interface SuggestionSectionGroupProps {
  section: SuggestionSection;
  onSelect: (item: SuggestionItem) => void;
  onHover?: (item: SuggestionItem) => void;
  activeItemId?: string;
}

export function SuggestionSectionGroup({
  section,
  onSelect,
  onHover,
  activeItemId,
}: SuggestionSectionGroupProps) {
  const headerId = `section-${section.id}-header`;

  return (
    <div role="group" aria-labelledby={headerId} className={styles.group}>
      <div id={headerId} className={styles.header}>
        <span className={styles.headerTitle}>{section.title}</span>
      </div>
      {section.items.map((item) => (
        <SuggestionItemRow
          key={item.id}
          item={item}
          icon={section.icon}
          isActive={item.id === activeItemId}
          onSelect={() => onSelect(item)}
          onHover={() => onHover?.(item)}
          id={`suggestion-item-${item.id}`}
        />
      ))}
    </div>
  );
}
