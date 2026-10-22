import {LAYOUTS, type Layout} from '../layout.js';
import styles from './LayoutToggle.module.css';

const LABELS: Record<Layout, string> = {
  stacked: 'Stacked',
  floating: 'Floating chat',
};

interface LayoutToggleProps {
  layout: Layout;
  onChange: (layout: Layout) => void;
}

/** PROTOTYPE (COMSHOPX-1470): switches how the page places search results. */
export function LayoutToggle({layout, onChange}: LayoutToggleProps) {
  return (
    <div className={styles.toggle} role="radiogroup" aria-label="Results layout">
      {LAYOUTS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={layout === option}
          className={layout === option ? `${styles.option} ${styles.active}` : styles.option}
          onClick={() => onChange(option)}
        >
          {LABELS[option]}
        </button>
      ))}
    </div>
  );
}
