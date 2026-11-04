import {useEffect, useId, useRef, useState} from 'react';
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
  const toggle = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const close = (event: MouseEvent) => {
      if (!menu.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const needle = filter.trim().toLowerCase();
  const listings = LISTINGS.filter(
    ({name, slug}) => name.toLowerCase().includes(needle) || slug.includes(needle)
  );

  return (
    <div className={styles.listingMenu} ref={menu}>
      <button
        ref={toggle}
        type="button"
        className={current ? `${styles.navButton} ${styles.navButtonActive}` : styles.navButton}
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((value) => !value)}
      >
        Listing pages ▾
      </button>
      {open && (
        <div id={popoverId} className={styles.listingPopover}>
          <input
            aria-label="Filter listing pages"
            placeholder="Search"
            value={filter}
            autoFocus
            onChange={(event) => setFilter(event.target.value)}
          />
          <ul aria-label="Listing pages">
            {listings.map(({slug, name}) => (
              <li key={slug}>
                <button
                  type="button"
                  aria-current={slug === current ? 'page' : undefined}
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
