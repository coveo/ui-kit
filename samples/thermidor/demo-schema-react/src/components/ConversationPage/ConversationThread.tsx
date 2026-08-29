import type {Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from './AgentResponseBlock.js';
import {ErrorTurnBlock} from './ErrorTurnBlock.js';
import {RoutedTurnBlock} from './RoutedTurnBlock.js';
import {ThinkingBlock} from './ThinkingBlock.js';
import {UserPromptBubble} from './UserPromptBubble.js';
import {TurnSeparator} from './TurnSeparator.js';
import styles from './ConversationThread.module.css';

interface ConversationThreadProps {
  turns: Turn[];
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
}

export function ConversationThread({turns, turnRefs}: ConversationThreadProps) {
  return (
    <div className={styles.thread}>
      {turns.map((turn, index) => (
        <div key={turn.id}>
          <div
            className={styles.turnWrapper}
            role="article"
            aria-label={`Turn ${index + 1}`}
            ref={(el) => {
              if (el) {
                turnRefs.current.set(turn.id, el);
              }
            }}
          >
            <UserPromptBubble prompt={turn.prompt} />
            <div className={styles.agentContent}>{renderTurnContent(turn)}</div>
          </div>
          {index < turns.length - 1 && <TurnSeparator />}
        </div>
      ))}
    </div>
  );
}

function renderTurnContent(turn: Turn) {
  if (turn.status === 'error') {
    return <ErrorTurnBlock error={turn.error} />;
  }

  if (turn.status === 'complete' && turn.routedInterface) {
    return <RoutedTurnBlock />;
  }

  if (turn.agentResponse) {
    return (
      <AgentResponseBlock
        agentResponse={turn.agentResponse}
        isStreaming={turn.status === 'streaming'}
      />
    );
  }

  if (turn.status === 'streaming') {
    return <ThinkingBlock reasoningSteps={[]} isStreaming={true} />;
  }

  return null;
}
