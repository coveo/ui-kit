import {AgentResponseBlock} from '../../../demo-schema-react/src/components/ConversationPage/AgentResponseBlock.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import {usePageView} from './use-page-view.js';
import styles from './pages.module.css';

interface AssistantPageProps {
  prompt: string;
  /**
   * Whether the shopper came back to this answer with the browser. The server cannot restore an
   * answer yet, so nothing is sent and the page says so.
   */
  revisited: boolean;
}

/**
 * The assistant page (`storefront-preview-assistant`): the answer to the search the shopper
 * committed, its reasoning, and the surfaces its own turn created.
 */
export function AssistantPage({prompt, revisited}: AssistantPageProps) {
  const {turn, surfaces, ownsTurn} = usePageView();
  const isStreaming = turn?.status === 'streaming';
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{prompt}</h1>
      {revisited && (
        <p className={styles.note}>
          Going back to an assistant answer isn't supported yet. Ask again to get a new answer.
        </p>
      )}
      <PageTurnStatus turn={turn} />
      {turn && (
        <AgentResponseBlock response={turn.response} isStreaming={isStreaming}>
          <ViewSurfaces surfaces={surfaces} ownsTurn={ownsTurn} isStreaming={isStreaming} />
        </AgentResponseBlock>
      )}
    </main>
  );
}
