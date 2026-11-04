import type {ReactNode} from 'react';
import type {Turn} from '@coveo/thermidor';
import {TurnSurfaces} from '../../a2ui/surfaces.js';
import {SessionSearchBox} from '../SessionSearchBox/SessionSearchBox.js';
import {SuggestionPills} from '../SuggestionPills/SuggestionPills.js';
import {latestSearch} from './turns.js';
import styles from './ResultsPanel.module.css';

const SEARCH_STARTERS = ['wetsuits', 'kayaks', 'snorkel masks', 'paddleboards', 'surfboards'];

interface ResultsPanelProps {
  turns: readonly Turn[];
  /** A search typed in the panel; it waits for an answer in progress instead of joining it. */
  onSearch: (query: string) => void;
  /** Drawn at the end of the header, such as the layout switch. */
  headerEnd?: ReactNode;
}

/**
 * PROTOTYPE (HACK-408, after the COMSHOPX-1470 spike): the shopper's side of the page. It shows
 * the newest search results and keeps them usable, whatever the assistant is doing: filters,
 * sort and paging go through beside an answer.
 */
export function ResultsPanel({turns, onSearch, headerEnd}: ResultsPanelProps) {
  const latest = latestSearch(turns);
  return (
    <section className={styles.panel} aria-label="Results">
      <header className={styles.header}>
        <span className={styles.brand}>Barca Sports</span>
        <div className={styles.searchBox}>
          <SessionSearchBox
            onSubmit={onSearch}
            busy={false}
            placeholder="Search the store…"
            suggestionsPlacement="below"
          />
        </div>
        {headerEnd}
      </header>
      <div className={styles.body}>
        {latest ? (
          <TurnSurfaces
            surfaces={[latest.surface]}
            interactive
            isStreaming={latest.turn.status === 'streaming'}
          />
        ) : (
          <div className={styles.empty}>
            <h1 className={styles.emptyTitle}>Find your gear</h1>
            <p className={styles.emptyText}>
              Search the store here, or ask the assistant. You can keep browsing while it works.
            </p>
            <SuggestionPills onSelect={onSearch} suggestions={SEARCH_STARTERS} />
          </div>
        )}
      </div>
    </section>
  );
}
