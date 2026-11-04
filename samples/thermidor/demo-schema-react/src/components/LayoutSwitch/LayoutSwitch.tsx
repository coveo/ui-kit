import {LAYOUT_LABELS, LAYOUTS, type Layout} from '../layout.js';
import styles from './LayoutSwitch.module.css';

interface LayoutSwitchProps {
  layout: Layout;
  onChange: (layout: Layout) => void;
  /** Pinned to the corner of the page, for layouts without a header to hold it. */
  pinned?: boolean;
}

/** PROTOTYPE (HACK-408): switches between the feed and the two assistant layouts. */
export function LayoutSwitch({layout, onChange, pinned = false}: LayoutSwitchProps) {
  return (
    <div
      className={`${styles.switch}${pinned ? ` ${styles.pinned}` : ''}`}
      role="radiogroup"
      aria-label="Layout"
    >
      {LAYOUTS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === layout}
          className={styles.option}
          onClick={() => onChange(option)}
        >
          {LAYOUT_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
