import type {Ref} from 'react';
import {CartButton} from '../Cart/CartButton.js';
import styles from './TopBar.module.css';

interface TopBarProps {
  drawerId: string;
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  drawerToggleRef: Ref<HTMLButtonElement>;
}

export function TopBar({drawerId, drawerOpen, onToggleDrawer, drawerToggleRef}: TopBarProps) {
  return (
    <header className={styles.bar}>
      <button
        ref={drawerToggleRef}
        type="button"
        className={styles.drawerToggle}
        aria-label="Conversations"
        aria-expanded={drawerOpen}
        aria-controls={drawerOpen ? drawerId : undefined}
        onClick={onToggleDrawer}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <CartButton />
    </header>
  );
}
