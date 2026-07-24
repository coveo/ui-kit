import type {SuggestionItem, SuggestionIconType} from './types.js';
import styles from './SuggestionItemRow.module.css';

interface SuggestionItemRowProps {
  item: SuggestionItem;
  icon: SuggestionIconType;
  isActive: boolean;
  onSelect: () => void;
  id: string;
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

const ICON_MAP = {
  search: SearchIcon,
  sparkle: SparkleIcon,
  settings: SettingsIcon,
};

export function SuggestionItemRow({item, icon, isActive, onSelect, id}: SuggestionItemRowProps) {
  const IconComponent = ICON_MAP[icon];

  return (
    <div
      id={id}
      role="option"
      aria-selected={isActive}
      className={`${styles.row} ${isActive ? styles.active : ''}`}
      onMouseDown={onSelect}
    >
      <IconComponent />
      <div className={styles.content}>
        <span className={styles.label}>{item.label}</span>
        {item.subtitle && <span className={styles.subtitle}>{item.subtitle}</span>}
      </div>
    </div>
  );
}
