import {useEffect, useRef} from 'react';
import {A2UIRenderer} from '@copilotkit/a2ui-renderer';
import {SearchBox} from './SearchBox.js';
import styles from './SearchPanel.module.css';

interface SearchPanelProps {
  /** The render id of the search surface to show, if any search has run yet. */
  surfaceId: string | undefined;
  /**
   * Whether a turn is running. The gateway runs one turn at a time per conversation, so the
   * panel's controls wait for the agent's answer instead of failing with a 409.
   */
  isStreaming: boolean;
  /** The search box waits while a request that locks the surface is in flight. */
  promptDisabled: boolean;
  /** Sends the search box's text as a prompt. */
  onSubmit: (prompt: string) => void;
}

/**
 * PROTOTYPE (COMSHOPX-1470): the floating layout's persistent results panel. It always shows
 * the latest search surface, whichever turn created it; a newer search replaces it here while its
 * trace stays in the conversation.
 */
export function SearchPanel({surfaceId, isStreaming, promptDisabled, onSubmit}: SearchPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo?.({top: 0});
  }, [surfaceId]);

  return (
    <section className={styles.panel} aria-label="Search results" ref={scrollRef}>
      <div className={styles.searchBar}>
        <SearchBox onSubmit={onSubmit} isStreaming={promptDisabled} />
      </div>
      {surfaceId === undefined ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Search results appear here</p>
          <p>Search above, or pick a search suggestion from the assistant.</p>
        </div>
      ) : (
        <fieldset
          className={isStreaming ? `${styles.surface} ${styles.busy}` : styles.surface}
          disabled={isStreaming}
          aria-busy={isStreaming}
        >
          <div className="catalog-surface" key={surfaceId}>
            <A2UIRenderer surfaceId={surfaceId} />
          </div>
        </fieldset>
      )}
    </section>
  );
}
