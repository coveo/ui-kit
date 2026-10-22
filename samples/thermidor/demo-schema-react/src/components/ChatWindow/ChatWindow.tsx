import {useEffect, useRef, useState, type ReactNode} from 'react';
import styles from './ChatWindow.module.css';

type WindowState = 'floating' | 'maximized' | 'minimized';

interface ChatWindowProps {
  /** Whether the assistant is answering, shown on the minimized launcher. */
  isStreaming: boolean;
  /**
   * Changes when the agent starts a new answer. A minimized window opens for it, since a prompt
   * sent from the results search box can be routed to the agent.
   */
  answerKey?: string;
  /**
   * Whether the conversation holds visual answer blocks (carousels, comparisons, bundles). They
   * need more room than text, so the floating window opens wider.
   */
  wide?: boolean;
  /** The conversation: kept mounted while minimized so its scroll position and blocks survive. */
  children: ReactNode;
}

/**
 * PROTOTYPE (COMSHOPX-1470): the floating layout's conversation window. It floats over the
 * results, can be maximized to read wide answers such as comparisons, and minimizes to a
 * launcher.
 */
export function ChatWindow({isStreaming, answerKey, wide = false, children}: ChatWindowProps) {
  const [state, setState] = useState<WindowState>('floating');
  const isMaximized = state === 'maximized';

  const answerKeyRef = useRef(answerKey);
  useEffect(() => {
    if (answerKey === answerKeyRef.current) return;
    answerKeyRef.current = answerKey;
    if (answerKey !== undefined) {
      setState((current) => (current === 'minimized' ? 'floating' : current));
    }
  }, [answerKey]);

  useEffect(() => {
    if (!isMaximized) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setState('floating');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMaximized]);

  return (
    <>
      {isMaximized && (
        <div className={styles.backdrop} onClick={() => setState('floating')} aria-hidden="true" />
      )}
      <div
        className={`${styles.window} ${styles[state]}${wide ? ` ${styles.wide}` : ''}`}
        role="dialog"
        aria-label="Shopping assistant"
        aria-modal={isMaximized}
        hidden={state === 'minimized'}
      >
        <header className={styles.header}>
          <span className={styles.title}>
            Shopping assistant
            {isStreaming && <span className={styles.busyDot} aria-label="Answering" />}
          </span>
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.control}
              onClick={() => setState(isMaximized ? 'floating' : 'maximized')}
              aria-label={isMaximized ? 'Restore chat' : 'Maximize chat'}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
            </button>
            <button
              type="button"
              className={styles.control}
              onClick={() => setState('minimized')}
              aria-label="Minimize chat"
              title="Minimize"
            >
              <MinimizeIcon />
            </button>
          </div>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
      {state === 'minimized' && (
        <button
          type="button"
          className={styles.launcher}
          onClick={() => setState('floating')}
          aria-label="Open shopping assistant"
        >
          <ChatIcon />
          <span>Ask the assistant</span>
          {isStreaming && <span className={styles.busyDot} aria-label="Answering" />}
        </button>
      )}
    </>
  );
}

function MaximizeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M9 2h5v5M7 14H2V9M14 2 9.5 6.5M2 14l4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M14 7H9V2M2 9h5v5M9 7l5-5M7 9l-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
