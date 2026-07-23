import type {Turn} from '@coveo/thermidor';
import {UserPrompt} from '../UserPrompt/UserPrompt.js';
import {AgentResponse} from '../AgentResponse/AgentResponse.js';
import {RoutedCommerceResults} from '../RoutedCommerceResults/RoutedCommerceResults.js';
import {RoutedSearchResults} from '../RoutedSearchResults/RoutedSearchResults.js';
import styles from './ConversationArea.module.css';

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
      {turn.routedInterface?.useCase === 'commerceSearch' && (
        <RoutedCommerceResults interface={turn.routedInterface.interface} />
      )}
      {turn.routedInterface?.useCase === 'search' && (
        <RoutedSearchResults interface={turn.routedInterface.interface} />
      )}
    </div>
  );
}
