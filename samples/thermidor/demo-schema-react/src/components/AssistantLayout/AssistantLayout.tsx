import {useCallback, useMemo, useState, useSyncExternalStore, type ReactNode} from 'react';
import type {Turn} from '@coveo/thermidor';
import {useSession} from '../../context/session.js';
import {
  isAnswerTakingActions,
  isBlocking,
  searchWhenFree,
  submitQuery,
} from '../../a2ui/session-request.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import {AssistantThread} from './AssistantThread.js';
import {AssistantWindow} from './AssistantWindow.js';
import {ResultsPanel} from './ResultsPanel.js';
import {answerSurfaces, hasAgentContent, SEARCH_ROOT} from './turns.js';
import styles from './AssistantLayout.module.css';

interface AssistantLayoutProps {
  mode: 'floating' | 'docked';
  onModeChange: (mode: 'floating' | 'docked') => void;
  /** The layout switch, drawn in the results header. */
  layoutSwitch: ReactNode;
}

/**
 * PROTOTYPE (HACK-408, after the COMSHOPX-1470 spike): two lanes on one session. The results
 * panel is the shopper's and is never locked by an answer; the assistant answers in its own
 * window, floating or docked, where the shopper can add to an answer or stop it.
 */
export function AssistantLayout({mode, onModeChange, layoutSwitch}: AssistantLayoutProps) {
  const session = useSession();
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot
  );
  const {turns, request} = snapshot;

  const streamingTurn = turns.find((turn) => turn.status === 'streaming');
  const isAnswering = streamingTurn !== undefined && !isSearchTurnInFlight(streamingTurn);
  const canAddToAnswer = isAnswerTakingActions(snapshot);
  const promptBusy = isBlocking(request) && !canAddToAnswer;

  const [panelSearches, setPanelSearches] = useState<ReadonlySet<string>>(() => new Set());
  const [stopFor, setStopFor] = useState<string>();
  const stopping = streamingTurn !== undefined && stopFor === streamingTurn.id;

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      setPanelSearches((current) => new Set(current).add(query));
      void searchWhenFree(session, query);
    },
    [session]
  );

  const handleAsk = useCallback(
    (prompt: string) => {
      const current = session.getSnapshot();
      if (!prompt.trim() || (isBlocking(current.request) && !isAnswerTakingActions(current))) {
        return;
      }
      void submitQuery(session, prompt);
    },
    [session]
  );

  const handleStop = useCallback(() => {
    setStopFor(streamingTurn?.id);
    void session.stop();
  }, [session, streamingTurn?.id]);

  // A minimized window opens when the agent starts answering, even a search typed in the panel.
  const answerKey = useMemo(
    () => [...turns].reverse().find((turn) => hasAgentContent(turn))?.id,
    [turns]
  );
  const wide = useMemo(() => turns.some((turn) => answerSurfaces(turn).length > 1), [turns]);

  return (
    <div className={styles.page} data-layout={mode}>
      <ResultsPanel turns={turns} onSearch={handleSearch} headerEnd={layoutSwitch} />
      <AssistantWindow
        mode={mode}
        isStreaming={isAnswering}
        stopping={stopping}
        onStop={handleStop}
        onToggleDock={() => onModeChange(mode === 'floating' ? 'docked' : 'floating')}
        answerKey={answerKey}
        wide={wide}
        contentVersion={turns}
        footer={
          <PromptInput
            onSubmit={handleAsk}
            busy={promptBusy}
            clearOnSubmit
            placeholder={
              isAnswering && canAddToAnswer ? 'Add to this answer…' : 'Ask the assistant…'
            }
          />
        }
      >
        <AssistantThread turns={turns} panelSearches={panelSearches} onAsk={handleAsk} />
      </AssistantWindow>
    </div>
  );
}

/** A turn answered by a search, not by the agent: the results panel shows its progress. */
function isSearchTurnInFlight(turn: Turn): boolean {
  return (
    !hasAgentContent(turn) &&
    turn.response.surfaces.some(({rootComponentType}) => rootComponentType === SEARCH_ROOT)
  );
}
