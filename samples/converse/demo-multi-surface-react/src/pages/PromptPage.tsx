import {useViewSurfaces} from '../session/storefront-session.js';
import {drawsSearch} from '../views/view-surfaces.js';
import {AssistantPage} from './AssistantPage.js';
import {SearchPage} from './SearchPage.js';
import styles from './pages.module.css';

interface PromptPageProps {
  prompt: string;
  visitId: number;
  /** The conversation turn whose search the page shows, if it shows one. */
  openingTurnId: string | undefined;
  /** The visits of the page's conversation. */
  conversationVisits: ReadonlySet<number>;
  /** Whether a request is in flight: the conversation's next prompt waits for it. */
  busy: boolean;
  /** Sends the next prompt of the assistant's conversation, on this visit. */
  onSend(prompt: string): void;
  onHome(): void;
  /** Returns to the previous page, if any. */
  onBack: (() => void) | undefined;
  /** Opens the search layout on the search a turn of the conversation drew. */
  onShowResults(turnId: string, query: string): void;
}

/**
 * The page of a prompt. The view it was sent on doesn't pick the layout, the answer to the prompt
 * does: a search surface opens the search layout with the chat panel, an answer of the agent
 * opens the assistant layout, where the conversation goes on. A later turn of the conversation
 * that draws a search opens the search layout on a new page (see `StorefrontApp`), so Back
 * returns to the conversation.
 */
export function PromptPage({
  prompt,
  visitId,
  openingTurnId,
  conversationVisits,
  busy,
  onSend,
  onHome,
  onBack,
  onShowResults,
}: PromptPageProps) {
  const answer = useViewSurfaces().turnsOfVisit(visitId)[0];
  if (openingTurnId !== undefined || (answer && drawsSearch(answer))) {
    return (
      <SearchPage
        query={prompt}
        visitId={visitId}
        openingTurnId={openingTurnId}
        conversationVisits={conversationVisits}
        onBack={onBack}
      />
    );
  }
  if (
    answer &&
    (answer.response.agent || answer.response.surfaces.length > 0 || answer.status !== 'streaming')
  ) {
    return (
      <AssistantPage
        prompt={prompt}
        conversationVisits={conversationVisits}
        busy={busy}
        onSend={onSend}
        onBack={onHome}
        onShowResults={onShowResults}
      />
    );
  }
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{prompt}</h1>
      <p className={styles.loading}>Working on “{prompt}”…</p>
    </main>
  );
}
