import type {StorefrontView} from '../session/storefront-session.js';
import {AssistantPage} from './AssistantPage.js';
import {SearchPage} from './SearchPage.js';
import {usePageView} from './use-page-view.js';
import styles from './pages.module.css';

/** The root component of a search surface: it opens the search layout. */
const SEARCH_ROOT = 'CommerceSearch';

interface PromptPageProps {
  prompt: string;
  visitId: number;
  view: StorefrontView;
  onBack(): void;
}

/**
 * The page of a prompt. The view it was sent on doesn't pick the layout, the answer does: a
 * search surface opens the search layout with the chat panel, an answer of the agent opens the
 * assistant layout.
 */
export function PromptPage({prompt, visitId, view, onBack}: PromptPageProps) {
  const {turn, surfaces} = usePageView(visitId, view);
  if (surfaces.some((surface) => surface.rootComponentType === SEARCH_ROOT)) {
    return <SearchPage query={prompt} visitId={visitId} turn={turn} surfaces={surfaces} />;
  }
  if (turn?.response.agent || surfaces.length > 0 || (turn && turn.status !== 'streaming')) {
    return <AssistantPage prompt={prompt} turn={turn} surfaces={surfaces} onBack={onBack} />;
  }
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{prompt}</h1>
      <p className={styles.loading}>Working on “{prompt}”…</p>
    </main>
  );
}
