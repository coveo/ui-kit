import type {SuggestionSection, SuggestionItem} from './types.js';
import {SuggestionItemRow} from './SuggestionItemRow.js';
import {actionOptionId, itemOptionId} from './options.js';
import styles from './SuggestionSectionGroup.module.css';

interface SuggestionSectionGroupProps {
  section: SuggestionSection;
  onSelect: (item: SuggestionItem) => void;
  onHover?: (item: SuggestionItem) => void;
  /** Called with the item whose remove button is pressed, in a section with a `removal`. */
  onRemove?: (item: SuggestionItem) => void;
  /** The element id of the highlighted option. */
  activeOptionId?: string;
}

export function SuggestionSectionGroup({
  section,
  onSelect,
  onHover,
  onRemove,
  activeOptionId,
}: SuggestionSectionGroupProps) {
  const headerId = `section-${section.id}-header`;
  const removalHintId = `section-${section.id}-removal-hint`;
  const {action, removal} = section;
  const actionId = actionOptionId(section);

  return (
    <div role="group" aria-labelledby={headerId} className={styles.group}>
      <div className={styles.header}>
        <span id={headerId} className={styles.headerTitle}>
          {section.title}
        </span>
        {action && (
          <div
            id={actionId}
            role="option"
            aria-selected={actionId === activeOptionId}
            aria-label={action.ariaLabel}
            className={styles.headerAction}
            onClick={action.onClick}
          >
            {action.label}
          </div>
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
          isActive={itemOptionId(item) === activeOptionId}
          onSelect={() => onSelect(item)}
          onHover={() => onHover?.(item)}
          id={itemOptionId(item)}
          onRemove={removal && onRemove && (() => onRemove(item))}
          removeLabel={removal?.ariaLabel(item)}
          describedBy={removal && removalHintId}
        />
      ))}
    </div>
  );
}
