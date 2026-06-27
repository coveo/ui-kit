import {type ComponentType} from 'react';
import {UserPrompt} from '../UserPrompt/UserPrompt.js';
import {
  AgentResponse,
  type SurfaceRendererProps,
} from '../AgentResponse/AgentResponse.js';
import {RoutedCommerceResults} from '../RoutedCommerceResults/RoutedCommerceResults.js';
import {RoutedSearchResults} from '../RoutedSearchResults/RoutedSearchResults.js';
import styles from './ConversationArea.module.css';

interface Turn {
  id: string;
  prompt: string;
  status: 'streaming' | 'complete' | 'error';
  routedInterface?: {useCase: string; interface: unknown};
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
  SurfaceRenderer: ComponentType<SurfaceRendererProps>;
}

export function ConversationArea({
  turn,
  isStreaming,
  onRetry,
  onAction,
  SurfaceRenderer,
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
          SurfaceRenderer={SurfaceRenderer}
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
