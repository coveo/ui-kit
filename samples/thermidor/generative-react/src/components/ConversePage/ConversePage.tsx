import {useEffect, useRef, useCallback, useState} from 'react';
import {buildConverseController} from '@coveo/thermidor';
import {useGenerativeInterface} from '../../context/generative-interface.js';
import {useBuildController} from '../../hooks/use-build-controller.js';
import {TurnsMenu} from '../TurnsMenu/TurnsMenu.js';
import {ConversationArea} from '../ConversationArea/ConversationArea.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import styles from './ConversePage.module.css';

const PROMPT_SUGGESTIONS = [
  'build a beginner surfing kit with budget, mid-range, and premium options',
  'what should i pack for a snorkeling trip?',
  'kayaks',
  'wetsuits',
  'surfboard care',
  'boating safety',
  'I like cold-water surfing. Compare wetsuits for it',
];

export function ConversePage() {
  const generativeInterface = useGenerativeInterface();

  const [controller, state] = useBuildController(() =>
    buildConverseController({interface: generativeInterface})
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollCooldownRef = useRef(false);
  const prevTurnCountRef = useRef(state.turns.length);
  const overscrollAccumRef = useRef(0);
  const overscrollResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const OVERSCROLL_THRESHOLD = 150;

  useEffect(() => {
    if (state.turns.length > prevTurnCountRef.current) {
      const newestTurn = state.turns[state.turns.length - 1];
      if (newestTurn && state.activeTurn?.id !== newestTurn.id) {
        controller.selectTurn({id: newestTurn.id});
      }
    }
    prevTurnCountRef.current = state.turns.length;
  }, [controller, state.turns]);

  const navigateToTurn = useCallback(
    (direction: 'prev' | 'next') => {
      if (scrollCooldownRef.current) return;
      const {turns, activeTurn} = stateRef.current;
      const currentIndex = turns.findIndex((t) => t.id === activeTurn?.id);
      if (currentIndex < 0) return;

      const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= turns.length) return;

      scrollCooldownRef.current = true;
      overscrollAccumRef.current = 0;
      controller.selectTurn({id: turns[targetIndex].id});

      setTimeout(() => {
        scrollCooldownRef.current = false;
      }, 600);
    },
    [controller]
  );

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      if (!el || scrollCooldownRef.current) return;

      const atTop = el.scrollTop <= 0;
      const atBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 2;

      const atBoundary = (atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0);

      if (!atBoundary) {
        overscrollAccumRef.current = 0;
        return;
      }

      overscrollAccumRef.current += Math.abs(e.deltaY);

      if (overscrollResetTimerRef.current) {
        clearTimeout(overscrollResetTimerRef.current);
      }
      overscrollResetTimerRef.current = setTimeout(() => {
        overscrollAccumRef.current = 0;
      }, 300);

      if (overscrollAccumRef.current >= OVERSCROLL_THRESHOLD) {
        if (atTop && e.deltaY < 0) {
          navigateToTurn('prev');
        } else if (atBottom && e.deltaY > 0) {
          navigateToTurn('next');
        }
      }
    }

    el.addEventListener('wheel', handleWheel, {passive: true});
    return () => el.removeEventListener('wheel', handleWheel);
  }, [navigateToTurn]);

  const handleSubmit = useCallback(
    (prompt: string) => {
      controller.submit({prompt});
    },
    [controller]
  );

  const handleSelectTurn = useCallback(
    (id: string) => {
      controller.selectTurn({id});
    },
    [controller]
  );

  const handleRetry = useCallback(
    (id: string) => {
      controller.retry({id});
    },
    [controller]
  );

  const handleAction = useCallback(
    (text: string, _type: string) => {
      handleSubmit(text);
    },
    [handleSubmit]
  );

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.sidebarCollapsed}`}>
        {sidebarOpen && (
          <TurnsMenu
            turns={state.turns}
            activeTurnId={state.activeTurn?.id}
            onSelectTurn={handleSelectTurn}
          />
        )}
      </aside>
      <button
        className={styles.toggleButton}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Collapse turns panel' : 'Expand turns panel'}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>
      <main className={styles.main}>
        <div className={styles.inputArea}>
          <PromptInput
            onSubmit={handleSubmit}
            disabled={state.isStreaming}
            suggestions={PROMPT_SUGGESTIONS}
          />
        </div>
        <div ref={contentRef} className={styles.content}>
          <ConversationArea
            key={state.activeTurn?.id ?? 'empty'}
            turn={state.activeTurn}
            isStreaming={state.isStreaming}
            onRetry={handleRetry}
            onAction={handleAction}
          />
        </div>
      </main>
    </div>
  );
}
