import {AgentResponseBlock} from '../../../demo-schema-react/src/components/ConversationPage/AgentResponseBlock.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import {usePageView} from './use-page-view.js';
import styles from './pages.module.css';

interface AssistantPageProps {
  prompt: string;
  visitId: number;
  onBack(): void;
}

/**
 * The assistant page (`storefront-preview-assistant`): the answer to the search the shopper
 * committed, its reasoning, and the surfaces its own turn created.
 */
export function AssistantPage({prompt, visitId, onBack}: AssistantPageProps) {
  const {turn, surfaces, ownsTurn} = usePageView(visitId);
  const isStreaming = turn?.status === 'streaming';
  return (
    <main className={styles.page}>
      <button type="button" className={styles.back} onClick={onBack}>
        ← Back to home
      </button>
      <h1 className={styles.title}>{prompt}</h1>
      <PageTurnStatus turn={turn} />
      {turn && (
        <AgentResponseBlock response={turn.response} isStreaming={isStreaming}>
          <ViewSurfaces surfaces={surfaces} ownsTurn={ownsTurn} isStreaming={isStreaming} />
        </AgentResponseBlock>
      )}
    </main>
  );
}
