import {ChatPanel} from '../components/ChatPanel.js';
import {useViewSurfaces} from '../session/storefront-session.js';
import {isSearchSurface, shopperText} from '../views/view-surfaces.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import styles from './pages.module.css';

interface SearchPageProps {
  query: string;
  visitId: number;
  /** The conversation turn whose search the page shows; without it, the page's own search. */
  openingTurnId: string | undefined;
  /** The visits of the conversation the chat panel shows and continues. */
  conversationVisits: ReadonlySet<number>;
  /** Returns to the previous page, if any. */
  onBack: (() => void) | undefined;
}

/**
 * The search layout: the latest search of the page on the left, such as the commerce search
 * layout with its facets, sort and pagination, answering the page's prompt or drawn by a turn of
 * the conversation. The assistant's chat panel is docked on the right, on the same visit: it shows
 * the conversation so far and continues it.
 */
export function SearchPage({
  query,
  visitId,
  openingTurnId,
  conversationVisits,
  onBack,
}: SearchPageProps) {
  const viewSurfaces = useViewSurfaces();
  const conversation = viewSurfaces.conversationOf(conversationVisits);
  const results = viewSurfaces.resultsOf(visitId, openingTurnId);
  const turn = results ?? viewSurfaces.turnsOfVisit(visitId)[0];
  // A conversation turn's other surfaces, such as its follow-ups, stay in the chat panel.
  const surfaces =
    results?.response.surfaces.filter(
      (surface) => !conversation.includes(results) || isSearchSurface(surface)
    ) ?? [];
  const isWaiting = !turn || turn.status === 'streaming';
  // A later search of the page, such as one the chat panel's answer drew, names its own query.
  const title = (results && shopperText(results)) ?? query;
  return (
    <main className={`${styles.page} ${styles.wide}`}>
      {onBack && (
        <button type="button" className={styles.back} onClick={onBack}>
          ← Back
        </button>
      )}
      <div className={styles.withPanel}>
        <h1 className={`${styles.title} ${styles.panelTitle}`}>Results for “{title}”</h1>
        <section className={styles.results} aria-label="Search results">
          <PageTurnStatus turn={turn} />
          {surfaces.length === 0 && isWaiting ? (
            <p className={styles.loading}>Searching…</p>
          ) : surfaces.length === 0 && turn?.status === 'complete' ? (
            <p className={styles.note}>The server sent no results for this search.</p>
          ) : (
            <ViewSurfaces surfaces={surfaces} isStreaming={turn?.status === 'streaming'} />
          )}
        </section>
        <ChatPanel visitId={visitId} turns={conversation} className={styles.panel} />
      </div>
    </main>
  );
}
