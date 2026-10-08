import {SLOTS, surfacesInSlot} from '../layout/surface-layout.js';
import {Slot} from '../layout/Slot.js';
import {useSurfaceLayout} from '../session/storefront-session.js';
import {SearchBox} from './SearchBox.js';
import styles from './TopBar.module.css';

interface TopBarProps {
  onHome(): void;
  onSearch(prompt: string): void;
  suggestionsOpen: boolean;
  onSuggestionsOpenChange(open: boolean): void;
}

/** The shell: it stays while the page below it changes, and so do its surfaces. */
export function TopBar({onHome, onSearch, suggestionsOpen, onSuggestionsOpenChange}: TopBarProps) {
  const layout = useSurfaceLayout();
  return (
    <header className={styles.bar}>
      <button type="button" className={styles.home} onClick={onHome}>
        Home
      </button>
      <SearchBox
        onCommit={onSearch}
        open={suggestionsOpen}
        onOpenChange={onSuggestionsOpenChange}
      />
      <Slot
        name={SLOTS.headerCart}
        surfaces={surfacesInSlot(layout, SLOTS.headerCart)}
        className={styles.cart}
      />
    </header>
  );
}
