import {AgentResponseBlock} from '../../../demo-schema-react/src/components/ConversationPage/AgentResponseBlock.js';
import {useViewSurfaces} from '../session/storefront-session.js';
import {SurfaceList} from '../views/SurfaceList.js';
import {PageTurnStatus} from './PageTurnStatus.js';
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
  const {stream, surfacesOfVisit, turnsOfVisit, latestTurnId} = useViewSurfaces();
  const turn = turnsOfVisit(visitId).at(-1);
  const isStreaming = turn?.status === 'streaming';
  return (
    <main className={styles.page}>
      <button type="button" className={styles.back} onClick={onBack}>
        ← Back to home
      </button>
      <h1 className={styles.title}>{prompt}</h1>
      <PageTurnStatus turn={turn} isLatestTurn={turn?.id === latestTurnId} />
      {turn && (
        <AgentResponseBlock response={turn.response} isStreaming={isStreaming}>
          <SurfaceList
            surfaceIds={surfacesOfVisit(visitId)}
            loadingSurfaces={stream.loadingSurfaces}
            isStreaming={isStreaming}
          />
        </AgentResponseBlock>
      )}
    </main>
  );
}
