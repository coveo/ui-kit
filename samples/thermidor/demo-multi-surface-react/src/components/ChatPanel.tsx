import {useEffect, useId, useRef, useState} from 'react';
import {AgentResponseBlock} from '../../../demo-schema-react/src/components/ConversationPage/AgentResponseBlock.js';
import {UserPromptBubble} from '../../../demo-schema-react/src/components/ConversationPage/UserPromptBubble.js';
import type {Turn} from '@coveo/thermidor';
import {PageTurnStatus} from '../pages/PageTurnStatus.js';
import {
  useSessionSnapshot,
  useStorefrontSend,
  useViewSurfaces,
  type StorefrontView,
} from '../session/storefront-session.js';
import {ASSISTANT_VIEW, isSearchSurface, shopperText} from '../views/view-surfaces.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import styles from './ChatPanel.module.css';

const PANEL_VIEW: StorefrontView = ASSISTANT_VIEW;

interface ChatPanelProps {
  visitId: number;
  /**
   * The conversation, oldest first: the turns of earlier pages, then the panel's own. A page that
   * belongs to no conversation, such as the home page, shows its own visit's.
   */
  turns?: readonly Turn[];
  className?: string;
}

/**
 * The assistant's chat panel next to a page, on the page's visit. It sends on
 * `storefront-preview-assistant`, so the server tells the agent what the shopper is looking at,
 * and draws the conversation: the turns asked before the page opened, such as on the assistant
 * page, then the panel's own. Their answers stay in the panel, and the page keeps its own, as do
 * the searches the conversation drew, shown on the page.
 */
export function ChatPanel({visitId, turns: conversation, className}: ChatPanelProps) {
  const visitConversation = useViewSurfaces().conversationOf(new Set([visitId]));
  const turns = conversation ?? visitConversation;
  const {sendPrompt} = useStorefrontSend();
  const {request} = useSessionSnapshot();
  const latestTurnId = turns.at(-1)?.id;
  const [value, setValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const headingId = useId();
  const bodyId = useId();
  const thread = useRef<HTMLOListElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const followsBottom = useRef(true);
  const turnCount = useRef(turns.length);
  const refocus = useRef(false);
  // The server runs one turn at a time per session, so a prompt sent while any view's request is
  // in flight would be refused.
  const disabled = request !== undefined;

  // The latest answer streams at the bottom of the thread; scroll the thread, not the page, and
  // leave a reader who scrolled up where they are until they send again.
  useEffect(() => {
    const sent = turns.length > turnCount.current;
    turnCount.current = turns.length;
    if (thread.current && (sent || followsBottom.current)) {
      thread.current.scrollTop = thread.current.scrollHeight;
      followsBottom.current = true;
    }
  }, [turns]);

  // Disabling the input drops focus to the body, so it gets it back once the answer ends, unless
  // the shopper has moved on to another control.
  useEffect(() => {
    if (!disabled && refocus.current) {
      refocus.current = false;
      if (document.activeElement === document.body) {
        input.current?.focus({preventScroll: true});
      }
    }
  }, [disabled]);

  const submit = (form: HTMLFormElement) => {
    const prompt = value.trim();
    if (!prompt || disabled) {
      return;
    }
    refocus.current = form.contains(document.activeElement);
    sendPrompt(PANEL_VIEW, prompt, visitId);
    setValue('');
  };

  return (
    <aside
      className={[styles.panel, isCollapsed && styles.collapsed, className]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={headingId}
    >
      <div className={styles.header}>
        <h2 id={headingId} className={styles.heading}>
          Shopping assistant
        </h2>
        {/* Only narrow screens, where the panel sits above the results, can fold it away. */}
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={!isCollapsed}
          aria-controls={bodyId}
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        >
          {isCollapsed ? 'Show' : 'Hide'}
        </button>
      </div>
      <div id={bodyId} className={styles.body}>
        {turns.length === 0 ? (
          <p className={styles.hint}>Ask about the results on this page.</p>
        ) : (
          <ol
            ref={thread}
            className={styles.thread}
            aria-label="Conversation"
            onScroll={({currentTarget}) => {
              const {scrollHeight, scrollTop, clientHeight} = currentTarget;
              followsBottom.current = scrollHeight - scrollTop - clientHeight < 32;
            }}
          >
            {turns.map((turn) => {
              const isStreaming = turn.status === 'streaming';
              const text = shopperText(turn);
              return (
                <li key={turn.id} className={styles.turn} aria-busy={isStreaming}>
                  {text !== undefined && <UserPromptBubble prompt={text} />}
                  <PageTurnStatus turn={turn} />
                  <AgentResponseBlock response={turn.response} isStreaming={isStreaming}>
                    <ViewSurfaces
                      surfaces={turn.response.surfaces.filter(
                        (surface) => !isSearchSurface(surface)
                      )}
                      interactive={turn.id === latestTurnId}
                      isStreaming={isStreaming}
                    />
                  </AgentResponseBlock>
                </li>
              );
            })}
          </ol>
        )}
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            submit(event.currentTarget);
          }}
        >
          <input
            ref={input}
            className={styles.input}
            type="text"
            value={value}
            placeholder="Ask the shopping assistant"
            aria-label="Ask the shopping assistant"
            disabled={disabled}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
          <button type="submit" className={styles.send} disabled={disabled || !value.trim()}>
            Send
          </button>
        </form>
      </div>
    </aside>
  );
}
