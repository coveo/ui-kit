import {useEffect, useId, useRef, useState} from 'react';
import {AgentResponseBlock} from '../../../demo-schema-react/src/components/ConversationPage/AgentResponseBlock.js';
import {UserPromptBubble} from '../../../demo-schema-react/src/components/ConversationPage/UserPromptBubble.js';
import {PageTurnStatus} from '../pages/PageTurnStatus.js';
import {usePageView} from '../pages/use-page-view.js';
import {
  useSessionSnapshot,
  useStorefrontSend,
  type StorefrontView,
} from '../session/storefront-session.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import styles from './ChatPanel.module.css';

const PANEL_VIEW: StorefrontView = 'storefront-preview-assistant';

/**
 * The assistant's chat panel next to a page, on the page's visit. It sends on
 * `storefront-preview-assistant`, so the server tells the agent what the shopper is looking at,
 * and draws only the turns it sent: their answers stay in the panel, and the page keeps its own.
 */
export function ChatPanel({visitId}: {visitId: number}) {
  const {sendPrompt} = useStorefrontSend();
  const {request} = useSessionSnapshot();
  const {turns} = usePageView(visitId, PANEL_VIEW);
  const [value, setValue] = useState('');
  const headingId = useId();
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
    <aside className={styles.panel} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        Shopping assistant
      </h2>
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
            return (
              <li key={turn.id} className={styles.turn} aria-busy={isStreaming}>
                {turn.input.prompt && <UserPromptBubble prompt={turn.input.prompt} />}
                <PageTurnStatus turn={turn} />
                <AgentResponseBlock response={turn.response} isStreaming={isStreaming}>
                  <ViewSurfaces surfaces={turn.response.surfaces} isStreaming={isStreaming} />
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
    </aside>
  );
}
