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
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M9 4v16" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
      <CartButton />
    </header>
  );
}
