import {CartButton} from './CartButton/CartButton.js';
import {ListingMenu} from './ListingMenu.js';
import {SearchBox} from './SearchBox.js';
import styles from './TopBar.module.css';

interface TopBarProps {
  currentListing: string | undefined;
  onHome(): void;
  onListing(slug: string): void;
  onSearch(query: string, ai: boolean): void;
}

/** The shell: it stays while the page below it changes. */
export function TopBar({currentListing, onHome, onListing, onSearch}: TopBarProps) {
  return (
    <header className={styles.bar}>
      <nav className={styles.nav}>
        <button type="button" className={styles.home} onClick={onHome}>
          Storefront home
        </button>
        <ListingMenu current={currentListing} onSelect={onListing} />
      </nav>
      <SearchBox onCommit={onSearch} />
      <CartButton />
    </header>
  );
}
