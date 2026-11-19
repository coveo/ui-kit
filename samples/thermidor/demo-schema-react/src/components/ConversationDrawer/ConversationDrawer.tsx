import {useEffect, useId, useRef, useSyncExternalStore, type RefObject} from 'react';
import {useConversations, useSession} from '../../context/session.js';
import {isBlocking} from '../../a2ui/session-request.js';
import {useMediaQuery} from '../../hooks/use-media-query.js';
import {ConversationRow, NOT_READY} from './ConversationRow.js';
import {ComposeIcon, SpinnerIcon} from './drawer-icons.js';
import styles from './ConversationDrawer.module.css';

interface ConversationDrawerProps {
  id: string;
  /** The button that toggles the drawer, which a press outside the drawer leaves alone. */
  toggleRef: RefObject<HTMLButtonElement | null>;
  /** Closes the drawer, and gives the focus back to its toggle when `returnFocus` is set. */
  onClose: (returnFocus: boolean) => void;
}

/**
 * Lists the saved conversations, newest first, to open one, and starts a new one. On a narrow
 * screen it slides over the page, and closes once a conversation opens or on a press outside.
 * While the current conversation sends a request, the drawer does not swap it out: starting and
 * opening another wait, while a spinner takes the place of the "New conversation" icon.
 */
export function ConversationDrawer({id, toggleRef, onClose}: ConversationDrawerProps) {
  const {list, currentId, start, open} = useConversations();
  const session = useSession();
  const running = useSyncExternalStore(
    session.subscribe,
    () => isBlocking(session.getSnapshot().request),
    () => false
  );
  const reasonId = useId();
  const blockedBy = running ? reasonId : undefined;
  const overlay = useMediaQuery('(max-width: 767px)');
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!overlay) return;
    const onPointerDown = ({target}: PointerEvent) => {
      if (
        target instanceof Node &&
        !drawerRef.current?.contains(target) &&
        !toggleRef.current?.contains(target)
      ) {
        onClose(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [overlay, toggleRef, onClose]);

  // Opening the drawer leaves the focus on its toggle, where Escape closes it too.
  useEffect(() => {
    const toggle = toggleRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(true);
      }
    };
    toggle?.addEventListener('keydown', onKeyDown);
    return () => toggle?.removeEventListener('keydown', onKeyDown);
  }, [toggleRef, onClose]);

  const pick = (swap: () => void) => {
    swap();
    if (overlay) {
      onClose(true);
    }
  };

  return (
    <nav
      ref={drawerRef}
      id={id}
      className={styles.drawer}
      aria-label="Conversations"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose(true);
        }
      }}
      onBlur={({relatedTarget}) => {
        if (
          overlay &&
          relatedTarget instanceof Node &&
          !drawerRef.current?.contains(relatedTarget) &&
          !toggleRef.current?.contains(relatedTarget)
        ) {
          onClose(false);
        }
      }}
    >
      <button
        type="button"
        className={styles.start}
        aria-disabled={running || undefined}
        aria-busy={running || undefined}
        aria-describedby={blockedBy}
        title={running ? NOT_READY : undefined}
        onClick={() => !running && pick(start)}
      >
        {running ? <SpinnerIcon className={styles.spinner} /> : <ComposeIcon />}
        New conversation
      </button>
      <span id={reasonId} hidden>
        {NOT_READY}
      </span>
      {list.length === 0 ? (
        <p className={styles.empty}>No saved conversations yet.</p>
      ) : (
        <ul className={styles.list}>
          {list.map(({id, title}) => (
            <li key={id}>
              <ConversationRow
                title={title}
                current={id === currentId}
                openBlockedBy={id === currentId ? undefined : blockedBy}
                onOpen={() => pick(() => open(id))}
              />
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
