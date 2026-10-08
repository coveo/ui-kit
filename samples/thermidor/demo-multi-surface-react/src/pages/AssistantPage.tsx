import type {Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from '../../../demo-schema-react/src/components/ConversationPage/AgentResponseBlock.js';
import {SLOTS, surfacesInSlot} from '../layout/surface-layout.js';
import {Slot} from '../layout/Slot.js';
import {useSurfaceLayout} from '../session/storefront-session.js';
import styles from './pages.module.css';

interface AssistantPageProps {
  prompt: string;
  sinceTurnIndex: number;
  /** The turn this visit opened, once it exists. */
  turn: Turn | undefined;
  onBack(): void;
}

/** The assistant page: the answer to the search the shopper committed, with its surfaces. */
export function AssistantPage({prompt, sinceTurnIndex, turn, onBack}: AssistantPageProps) {
  const layout = useSurfaceLayout();
  const surfaces = surfacesInSlot(layout, SLOTS.main, sinceTurnIndex);
  return (
    <main className={styles.page}>
      <button type="button" className={styles.back} onClick={onBack}>
        ← Back to home
      </button>
      <h1 className={styles.title}>{prompt}</h1>
      {turn?.status === 'error' && (
        <p className={styles.error}>This answer stopped early: {turn.error}</p>
      )}
      {turn && (
        <AgentResponseBlock response={turn.response} isStreaming={turn.status === 'streaming'}>
          <Slot name={SLOTS.main} surfaces={surfaces} className={styles.surfaces} />
        </AgentResponseBlock>
      )}
    </main>
  );
}
