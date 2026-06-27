import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ComponentType,
} from 'react';
import {TurnsMenu} from '../TurnsMenu/TurnsMenu.js';
import {ConversationArea} from '../ConversationArea/ConversationArea.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import type {SurfaceRendererProps} from '../AgentResponse/AgentResponse.js';
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

interface ConverseState {
  turns: Turn[];
  activeTurnId: string | undefined;
  activeTurn: Turn | undefined;
  isStreaming: boolean;
}

interface ConverseController {
  state: ConverseState;
  subscribe: (cb: () => void) => () => void;
  submit: (opts: {prompt: string}) => void;
  selectTurn: (opts: {id: string}) => void;
  retry: (opts: {id: string}) => void;
}

export interface ConversePageProps {
  controller: ConverseController;
  SurfaceRenderer: ComponentType<SurfaceRendererProps>;
}

export function ConversePage({controller, SurfaceRenderer}: ConversePageProps) {
  const [state, setState] = useState<ConverseState>(controller.state);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollCooldownRef = useRef(false);
  const prevTurnCountRef = useRef(controller.state.turns.length);
  const overscrollAccumRef = useRef(0);
  const overscrollResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  const OVERSCROLL_THRESHOLD = 150;

  useEffect(() => {
    const unsubscribe = controller.subscribe(() => {
      const newState = controller.state;

      if (newState.turns.length > prevTurnCountRef.current) {
        const newestTurn = newState.turns[newState.turns.length - 1];
        if (newestTurn && newState.activeTurnId !== newestTurn.id) {
          controller.selectTurn({id: newestTurn.id});
        }
      }
      prevTurnCountRef.current = newState.turns.length;

      setState(newState);
    });
    return unsubscribe;
  }, [controller]);

  const navigateToTurn = useCallback(
    (direction: 'prev' | 'next') => {
      if (scrollCooldownRef.current) return;
      const {turns, activeTurnId} = stateRef.current;
      const currentIndex = turns.findIndex((t) => t.id === activeTurnId);
      if (currentIndex < 0) return;

      const targetIndex =
        direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
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
      const atBottom =
        Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 2;

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
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? '' : styles.sidebarCollapsed}`}
      >
        {sidebarOpen && (
          <TurnsMenu
            turns={state.turns}
            activeTurnId={state.activeTurnId}
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
            key={state.activeTurnId ?? 'empty'}
            turn={state.activeTurn}
            isStreaming={state.isStreaming}
            onRetry={handleRetry}
            onAction={handleAction}
            SurfaceRenderer={SurfaceRenderer}
          />
        </div>
      </main>
    </div>
  );
}
