import type React from 'react';
import {truncateText} from '../../utils.js';
import styles from './TurnsMenu.module.css';

interface Turn {
  id: string;
  prompt: string;
  status: 'streaming' | 'complete' | 'error';
}

export interface TurnsMenuProps {
  turns: Turn[];
  activeTurnId: string | undefined;
  onSelectTurn: (id: string) => void;
}

export function TurnsMenu({turns, activeTurnId, onSelectTurn}: TurnsMenuProps) {
  return (
    <nav className={styles.nav} aria-label="Conversation turns">
      {turns.length === 0 && (
        <p className={styles.empty}>No conversation turns yet</p>
      )}
      {turns.length > 0 && (
        <ul className={styles.list}>
          {turns.map((turn) => {
            const isActive = turn.id === activeTurnId;
            return (
              <li
                key={turn.id}
                className={`${styles.item}${isActive ? ` ${styles.active}` : ''}`}
                onClick={() => onSelectTurn(turn.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTurn(turn.id);
                  }
                }}
                aria-current={isActive ? 'true' : undefined}
              >
                {truncateText(turn.prompt, 40)}
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
