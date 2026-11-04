import {useEffect, useRef, useState, type ReactNode} from 'react';
import styles from './AssistantWindow.module.css';

type WindowState = 'open' | 'maximized' | 'minimized';

interface AssistantWindowProps {
  /** Floating over the results, or docked as a column beside them. */
  mode: 'floating' | 'docked';
  isStreaming: boolean;
  /** "Stopping…" once the shopper asked to stop the answer in progress. */
  stopping: boolean;
  onStop: () => void;
  /** Moves the window between floating and docked. */
  onToggleDock: () => void;
  /** Changes when the agent starts a new answer: a minimized window opens for it. */
  answerKey?: string;
  /** Whether the conversation holds visual answers, which need a wider window. */
  wide: boolean;
  /** Changes as the conversation grows, to keep it scrolled to its end. */
  contentVersion: unknown;
  /** The conversation; kept mounted while minimized so it keeps its scroll position. */
  children: ReactNode;
  /** The prompt, pinned under the conversation. */
  footer: ReactNode;
}

/**
 * PROTOTYPE (HACK-408, after the COMSHOPX-1470 spike): the assistant's window. It never covers
 * the results for long: it floats in a corner, docks beside them, minimizes to a launcher that
 * still says when it is working, or maximizes to read a wide answer.
 */
export function AssistantWindow({
  mode,
  isStreaming,
  stopping,
  onStop,
  onToggleDock,
  answerKey,
  wide,
  contentVersion,
  children,
  footer,
}: AssistantWindowProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  useStickToBottom(bodyRef, contentVersion);
  const [state, setState] = useState<WindowState>('open');
  const floating = mode === 'floating';
  const effective: WindowState = floating ? state : 'open';

  const answerKeyRef = useRef(answerKey);
  useEffect(() => {
    if (answerKey === answerKeyRef.current) return;
    answerKeyRef.current = answerKey;
    if (answerKey !== undefined) {
      setState((current) => (current === 'minimized' ? 'open' : current));
    }
  }, [answerKey]);

  useEffect(() => {
    if (effective !== 'maximized') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setState('open');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [effective]);

  const status = isStreaming ? (stopping ? 'Stopping…' : 'Working on your answer') : undefined;

  return (
    <>
      {effective === 'maximized' && (
        <div className={styles.backdrop} onClick={() => setState('open')} aria-hidden="true" />
      )}
      <section
        className={[
          styles.window,
          floating ? styles.floating : styles.docked,
          effective === 'maximized' && styles.maximized,
          floating && wide && styles.wide,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Shopping assistant"
        hidden={effective === 'minimized'}
      >
        <header className={styles.header}>
          <div className={styles.title}>
            <span className={styles.avatar} aria-hidden="true">
              ✦
            </span>
            <span>
              Shopping assistant
              <span className={styles.status} aria-live="polite">
                {status ?? 'Ask anything, keep browsing'}
              </span>
            </span>
          </div>
          {isStreaming && (
            <button
              type="button"
              className={`${styles.control} ${styles.stop}`}
              onClick={onStop}
              disabled={stopping}
              aria-label="Stop the answer"
            >
              {stopping ? 'Stopping…' : 'Stop'}
            </button>
          )}
          <button
            type="button"
            className={styles.control}
            onClick={onToggleDock}
            aria-label={floating ? 'Dock beside the results' : 'Float over the results'}
            title={floating ? 'Dock' : 'Float'}
          >
            {floating ? '⇥' : '⧉'}
          </button>
          {floating && (
            <>
              <button
                type="button"
                className={styles.control}
                onClick={() => setState(effective === 'maximized' ? 'open' : 'maximized')}
                aria-label={
                  effective === 'maximized' ? 'Restore the assistant' : 'Maximize the assistant'
                }
                title={effective === 'maximized' ? 'Restore' : 'Maximize'}
              >
                {effective === 'maximized' ? '⤡' : '⤢'}
              </button>
              <button
                type="button"
                className={styles.control}
                onClick={() => setState('minimized')}
                aria-label="Minimize the assistant"
                title="Minimize"
              >
                –
              </button>
            </>
          )}
        </header>
        <div ref={bodyRef} className={styles.body}>
          {children}
        </div>
        <div className={styles.footer}>{footer}</div>
      </section>
      {effective === 'minimized' && (
        <button
          type="button"
          className={styles.launcher}
          onClick={() => setState('open')}
          aria-label="Open the shopping assistant"
        >
          <span className={styles.avatar} aria-hidden="true">
            ✦
          </span>
          {isStreaming ? 'Working on your answer…' : 'Ask the assistant'}
          {isStreaming && <span className={styles.busyDot} aria-hidden="true" />}
        </button>
      )}
    </>
  );
}

/** Keeps a scrolled container at its bottom as content arrives, unless the shopper scrolled up. */
function useStickToBottom(ref: React.RefObject<HTMLElement | null>, dependency: unknown): void {
  const pinned = useRef(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onScroll = () => {
      pinned.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
    };
    element.addEventListener('scroll', onScroll);
    return () => element.removeEventListener('scroll', onScroll);
  }, [ref]);
  useEffect(() => {
    const element = ref.current;
    if (element && pinned.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [ref, dependency]);
}
