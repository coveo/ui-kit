import type {SuggestionSection, SuggestionItem} from './types.js';
import {SuggestionItemRow} from './SuggestionItemRow.js';
import styles from './SuggestionSectionGroup.module.css';

interface SuggestionSectionGroupProps {
  section: SuggestionSection;
  onSelect: (item: SuggestionItem) => void;
  onHover?: (item: SuggestionItem) => void;
  /** Called with the item whose remove button is pressed, instead of the section's `removal`. */
  onRemove?: (item: SuggestionItem) => void;
  activeItemId?: string;
}

export function SuggestionSectionGroup({
  section,
  onSelect,
  onHover,
  onRemove,
  activeItemId,
}: SuggestionSectionGroupProps) {
  const headerId = `section-${section.id}-header`;
  const removalHintId = `section-${section.id}-removal-hint`;
  const {action, removal} = section;

  return (
    <div role="group" aria-labelledby={headerId} className={styles.group}>
      <div className={styles.header}>
        <span id={headerId} className={styles.headerTitle}>
          {section.title}
        </span>
        {action && (
          <button
            type="button"
            className={styles.headerAction}
            aria-label={action.ariaLabel}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
        {removal && (
          <span id={removalHintId} hidden>
            Press Shift+Delete to remove it.
          </span>
        )}
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
          onRemove={removal && (() => (onRemove ?? removal.onRemove)(item))}
          removeLabel={removal?.ariaLabel(item)}
          describedBy={removal && removalHintId}
        />
      ))}
    </div>
  );
}
