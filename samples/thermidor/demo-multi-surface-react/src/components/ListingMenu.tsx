import {useEffect, useRef, useState} from 'react';
import {LISTINGS} from '../navigation.js';
import styles from './TopBar.module.css';

interface ListingMenuProps {
  current: string | undefined;
  onSelect(slug: string): void;
}

/** The storefront's listing pages, filtered by name or path, as in the Merchandising Hub. */
export function ListingMenu({current, onSelect}: ListingMenuProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const close = (event: MouseEvent) => {
      if (!menu.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const needle = filter.trim().toLowerCase();
  const listings = LISTINGS.filter(
    ({name, slug}) => name.toLowerCase().includes(needle) || slug.includes(needle)
  );

  return (
    <div className={styles.listingMenu} ref={menu}>
      <button
        type="button"
        className={current ? `${styles.navButton} ${styles.navButtonActive}` : styles.navButton}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        Listing pages ▾
      </button>
      {open && (
        <div className={styles.listingPopover}>
          <input
            aria-label="Filter listing pages"
            placeholder="Search"
            value={filter}
            autoFocus
            onChange={(event) => setFilter(event.target.value)}
          />
          <ul role="menu">
            {listings.map(({slug, name}) => (
              <li key={slug} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={
                    slug === current
                      ? `${styles.listingItem} ${styles.listingItemCurrent}`
                      : styles.listingItem
                  }
                  onClick={() => {
                    setOpen(false);
                    setFilter('');
                    onSelect(slug);
                  }}
                >
                  <span>{name}</span>
                  <span className={styles.listingPath}>/{slug}</span>
                </button>
              </li>
            ))}
            {listings.length === 0 && <li className={styles.listingEmpty}>No listing page</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
