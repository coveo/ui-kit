import {CloseIcon} from '../../a2ui/icons/index.js';
import {HighlightedText} from '../HighlightedText/HighlightedText.js';
import type {SuggestionItem, SuggestionIconType} from './types.js';
import styles from './SuggestionItemRow.module.css';

interface SuggestionItemRowProps {
  item: SuggestionItem;
  icon: SuggestionIconType;
  isActive: boolean;
  onSelect: () => void;
  onHover?: () => void;
  id: string;
  /** Draws a remove button, named `removeLabel`, beside the option. */
  onRemove?: () => void;
  removeLabel?: string;
  /** The id of the element describing the option. */
  describedBy?: string;
}

function SearchIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" />
      <path d="M18 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
      <path d="M15 2l.5 1.5L17 4l-1.5.5L15 6l-.5-1.5L13 4l1.5-.5L15 2z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="8" cy="6" r="2" fill="currentColor" />
      <circle cx="16" cy="12" r="2" fill="currentColor" />
      <circle cx="10" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <polyline points="3 3 3 8 8 8" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

const ICON_MAP = {
  search: SearchIcon,
  sparkle: SparkleIcon,
  settings: SettingsIcon,
  history: HistoryIcon,
};

function Label({item}: {item: SuggestionItem}) {
  if (item.completes === undefined) {
    return <HighlightedText text={item.label} query={item.highlight ?? ''} wordStartsOnly />;
  }
  const typed = item.completes;
  if (!typed.trim() || !item.label.toLowerCase().startsWith(typed.toLowerCase())) {
    return item.label;
  }
  return (
    <>
      {item.label.slice(0, typed.length)}
      <strong>{item.label.slice(typed.length)}</strong>
    </>
  );
}

export function SuggestionItemRow({
  item,
  icon,
  isActive,
  onSelect,
  onHover,
  id,
  onRemove,
  removeLabel,
  describedBy,
}: SuggestionItemRowProps) {
  const IconComponent = ICON_MAP[icon];

  const option = (
    <div
      id={id}
      role="option"
      aria-selected={isActive}
      aria-describedby={describedBy}
      className={`${styles.row} ${isActive ? styles.active : ''}`}
      onMouseDown={onSelect}
      onMouseEnter={onHover}
    >
      <IconComponent />
      <div className={styles.content}>
        <span className={styles.label}>
          <Label item={item} />
        </span>
        {item.subtitle && <span className={styles.subtitle}>{item.subtitle}</span>}
      </div>
    </div>
  );

  if (!onRemove) {
    return option;
  }
  // The button stays out of the option, whose content is presentational, and out of the tab
  // order: the focus stays in the combobox, where Shift+Delete removes the highlighted option.
  return (
    <div className={styles.removable}>
      {option}
      <button
        type="button"
        className={styles.removeButton}
        tabIndex={-1}
        aria-label={removeLabel}
        onClick={onRemove}
      >
        <CloseIcon />
      </button>
    </div>
  );
}
