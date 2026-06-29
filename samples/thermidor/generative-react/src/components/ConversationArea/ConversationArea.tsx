import {useState, useEffect} from 'react';
import {UserPrompt} from '../UserPrompt/UserPrompt.js';
import {AgentResponse} from '../AgentResponse/AgentResponse.js';
import {InlineCarousel} from '../InlineCarousel/InlineCarousel.js';
import {generativeInterface} from '../../generative-setup.js';
import {getOrCreateBackendInterfacesSelectors} from '@/src/core/internal/backend-interfaces/backend-interfaces-selectors.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
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
  const [inlineInterfaces, setInlineInterfaces] = useState<
    Record<
      string,
      {type: string; display: string; state: Record<string, unknown>}
    >
  >({});

  const engine = generativeInterface[ENGINE];
  const stateId = generativeInterface[STATE_ID];

  useEffect(() => {
    const selectors = getOrCreateBackendInterfacesSelectors(stateId);
    return engine.subscribe(selectors.getInterfaces, (all) => {
      const inline = Object.fromEntries(
        Object.entries(all).filter(([, v]) => v.display === 'inline')
      );
      setInlineInterfaces(inline);
    });
  }, [engine, stateId]);

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
      {Object.entries(inlineInterfaces).map(([id, iface]) => (
        <InlineCarousel
          key={id}
          heading={(iface.state?.heading as string) ?? undefined}
          products={(iface.state?.products as Record<string, unknown>[]) ?? []}
        />
      ))}
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
