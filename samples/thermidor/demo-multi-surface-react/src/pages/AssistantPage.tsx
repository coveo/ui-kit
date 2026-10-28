import type {DiscoveredSurface, Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from '../../../demo-schema-react/src/components/ConversationPage/AgentResponseBlock.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import styles from './pages.module.css';

interface AssistantPageProps {
  prompt: string;
  turn: Turn | undefined;
  surfaces: readonly DiscoveredSurface[];
  onBack(): void;
}

/** The assistant layout: the agent's answer to a prompt, its reasoning, and its surfaces. */
export function AssistantPage({prompt, turn, surfaces, onBack}: AssistantPageProps) {
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
          <ViewSurfaces surfaces={surfaces} isStreaming={isStreaming} />
        </AgentResponseBlock>
      )}
    </main>
  );
}
