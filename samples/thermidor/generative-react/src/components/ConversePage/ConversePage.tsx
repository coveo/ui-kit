import {useState, useEffect, useRef, useCallback} from 'react';
import {converseController} from '../../generative-setup.js';
import {ConversationArea} from '../ConversationArea/ConversationArea.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import {BackendResults} from '../BackendResults/BackendResults.js';
import styles from './ConversePage.module.css';

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

interface ConverseState {
  turns: Turn[];
  activeTurnId: string | undefined;
  activeTurn: Turn | undefined;
  isStreaming: boolean;
}

export function ConversePage() {
  const [state, setState] = useState<ConverseState>(converseController.state);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return converseController.subscribe(() => {
      setState(converseController.state);
    });
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [state.turns.length, state.turns[state.turns.length - 1]?.agentResponse]);

  const handleSubmit = useCallback((prompt: string) => {
    converseController.submit({prompt});
  }, []);

  const handleRetry = useCallback((id: string) => {
    converseController.retry({id});
  }, []);

  const handleAction = useCallback(
    (text: string, _type: string) => {
      handleSubmit(text);
    },
    [handleSubmit]
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div ref={contentRef} className={styles.content}>
          {state.turns.length === 0 && (
            <p className={styles.placeholder}>
              Submit a prompt to start a conversation.
            </p>
          )}
          {state.turns.map((turn) => (
            <ConversationArea
              key={turn.id}
              turn={turn}
              isStreaming={state.isStreaming && turn.status === 'streaming'}
              onRetry={handleRetry}
              onAction={handleAction}
            />
          ))}
        </div>
        <div className={styles.inputArea}>
          <PromptInput onSubmit={handleSubmit} disabled={state.isStreaming} />
        </div>
      </main>
      <BackendResults />
    </div>
  );
}
