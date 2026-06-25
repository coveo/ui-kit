import {UserPrompt} from '../UserPrompt/UserPrompt.js';
import {AgentResponse} from '../AgentResponse/AgentResponse.js';
import styles from './ConversationArea.module.css';

interface Turn {
  id: string;
  prompt: string;
  status: 'streaming' | 'complete' | 'error';
  agentResponse?: {
    messages: {content: string; role: string}[];
    surfaces: Record<string, unknown>[];
    toolCalls: {
      id: string;
      name: string;
      args: string;
      result?: string;
      status: 'calling' | 'completed';
    }[];
  };
  error?: string;
}

export interface ConversationAreaProps {
  turn: Turn | undefined;
  isStreaming: boolean;
  onRetry?: (id: string) => void;
  onAction?: (text: string, type: string) => void;
}

export function ConversationArea({
  turn,
  isStreaming,
  onRetry,
  onAction,
}: ConversationAreaProps) {
  if (!turn) {
    return (
      <p className={styles.placeholder}>
        Submit a prompt to start a conversation.
      </p>
    );
  }

  return (
    <div className={styles.container}>
      <UserPrompt text={turn.prompt} />
      {turn.agentResponse && (
        <AgentResponse
          agentResponse={turn.agentResponse}
          isStreaming={isStreaming}
          onAction={onAction}
        />
      )}
      {turn.status === 'error' && (
        <div className={styles.error}>
          <p className={styles.errorMessage}>
            {turn.error ?? 'An unknown error occurred.'}
          </p>
          {onRetry && (
            <button
              className={styles.retryButton}
              onClick={() => onRetry(turn.id)}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
