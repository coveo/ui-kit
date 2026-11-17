import {useEffect, useId, useRef, useSyncExternalStore, type RefObject} from 'react';
import {useConversations, useSession} from '../../context/session.js';
import {isBlocking} from '../../a2ui/session-request.js';
import {useMediaQuery} from '../../hooks/use-media-query.js';
import {ConversationRow} from './ConversationRow.js';
import {ComposeIcon} from './drawer-icons.js';
import styles from './ConversationDrawer.module.css';

/** Why the drawer cannot swap the conversation while it sends a request, which would cancel it. */
const NOT_READY = 'Available once the conversation is ready';

interface ConversationDrawerProps {
  id: string;
  /** The button that toggles the drawer, which a press outside the drawer leaves alone. */
  toggleRef: RefObject<HTMLButtonElement | null>;
  /** Closes the drawer, and gives the focus back to its toggle when `returnFocus` is set. */
  onClose: (returnFocus: boolean) => void;
}

/**
 * Lists the saved conversations, newest first, to open, rename or delete one, and starts a new one.
 * On a narrow screen it slides over the page, and closes once a conversation opens or on a press
 * outside. Deleting a conversation moves the focus to the next one, or to "New conversation".
 * While the current conversation sends a request, the drawer does not swap it out: starting,
 * opening another and deleting the current one wait, with a line that says why.
 */
export function ConversationDrawer({id, toggleRef, onClose}: ConversationDrawerProps) {
  const {list, currentId, start, open, remove, rename} = useConversations();
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
  const startRef = useRef<HTMLButtonElement>(null);
  const focusAfterDelete = useRef<number>(undefined);

  useEffect(() => {
    const index = focusAfterDelete.current;
    if (index === undefined) return;
    focusAfterDelete.current = undefined;
    const rows = drawerRef.current?.querySelectorAll<HTMLButtonElement>(`.${styles.open}`) ?? [];
    (rows[Math.min(index, rows.length - 1)] ?? startRef.current)?.focus();
  }, [list]);

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
    >
      <button
        ref={startRef}
        type="button"
        className={styles.start}
        aria-disabled={running || undefined}
        aria-describedby={blockedBy}
        onClick={() => !running && pick(start)}
      >
        <ComposeIcon />
        New conversation
      </button>
      {running && (
        <p id={reasonId} className={styles.notReady}>
          {NOT_READY}
        </p>
      )}
      {list.length === 0 ? (
        <p className={styles.empty}>No saved conversations yet.</p>
      ) : (
        <ul className={styles.list}>
          {list.map(({id, title}, index) => (
            <li key={id}>
              <ConversationRow
                title={title}
                current={id === currentId}
                openBlockedBy={id === currentId ? undefined : blockedBy}
                deleteBlockedBy={id === currentId ? blockedBy : undefined}
                onOpen={() => pick(() => open(id))}
                onRename={(renamed) => rename(id, renamed)}
                onDelete={() => {
                  focusAfterDelete.current = index;
                  remove(id);
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
