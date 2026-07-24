import type {Turn} from '@coveo/thermidor';
import {useEffect, useRef} from 'react';
import {useScrollAnchor} from '../../hooks/use-scroll-anchor.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import {ConversationThread} from './ConversationThread.js';
import styles from './ConversationPage.module.css';

interface ConversationPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  turns: Turn[];
  onBackToSearch: () => void;
  canGoBackToSearch: boolean;
  onResetToLanding: () => void;
}

export function ConversationPage({
  onSubmit,
  isStreaming,
  turns,
  onBackToSearch,
  canGoBackToSearch,
  onResetToLanding,
}: ConversationPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevTurnCountRef = useRef<number>(0);
  const hasMountedRef = useRef(false);

  const {scrollToPrompt, clearPadding} = useScrollAnchor({
    containerRef,
    turnRefs,
  });
  const prevStreamingRef = useRef(isStreaming);

  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      clearPadding();
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, clearPadding]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (turns.length > 0) {
        const lastTurn = turns[turns.length - 1];
        requestAnimationFrame(() => {
          scrollToPrompt(lastTurn.id);
        });
      }
      prevTurnCountRef.current = turns.length;
      return;
    }

    if (turns.length > prevTurnCountRef.current) {
      const lastTurn = turns[turns.length - 1];
      requestAnimationFrame(() => {
        scrollToPrompt(lastTurn.id);
      });
    }

    prevTurnCountRef.current = turns.length;
  }, [turns, scrollToPrompt]);

  const handleAction = (text: string, _type: string) => {
    void _type;
    if (text) {
      onSubmit(text);
    }
  };

  return (
    <section className={styles.page}>
      <nav className={styles.nav} aria-label="Conversation navigation">
        {canGoBackToSearch && (
          <button
            type="button"
            className={styles.backButton}
            onClick={onBackToSearch}
          >
            &larr; Back to search results
          </button>
        )}
        <button
          type="button"
          className={styles.resetButton}
          onClick={onResetToLanding}
        >
          Reset
        </button>
      </nav>
      <div className={styles.scrollContainer} ref={containerRef}>
        <div className={styles.scrollContent}>
          <ConversationThread
            turns={turns}
            isStreaming={isStreaming}
            onAction={handleAction}
            turnRefs={turnRefs}
          />
        </div>
      </div>
      <div className={styles.promptContainer}>
        <div className={styles.promptWrapper}>
          <PromptInput
            onSubmit={onSubmit}
            disabled={isStreaming}
            clearOnSubmit
          />
        </div>
      </div>
    </section>
  );
}
