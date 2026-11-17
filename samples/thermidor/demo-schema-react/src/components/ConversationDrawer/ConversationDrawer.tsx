import {useEffect, useRef, type RefObject} from 'react';
import {useConversations} from '../../context/session.js';
import {useMediaQuery} from '../../hooks/use-media-query.js';
import {CloseIcon} from '../../a2ui/icons/index.js';
import styles from './ConversationDrawer.module.css';

interface ConversationDrawerProps {
  id: string;
  /** The button that toggles the drawer, which a press outside the drawer leaves alone. */
  toggleRef: RefObject<HTMLButtonElement | null>;
  /** Closes the drawer, and gives the focus back to its toggle when `returnFocus` is set. */
  onClose: (returnFocus: boolean) => void;
}

/**
 * Lists the saved conversations, newest first, to open or delete one, and starts a new one. On a
 * narrow screen it slides over the page, and closes once a conversation opens or on a press outside.
 */
export function ConversationDrawer({id, toggleRef, onClose}: ConversationDrawerProps) {
  const {list, currentId, start, open, remove} = useConversations();
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
      <button type="button" className={styles.start} onClick={() => pick(start)}>
        New conversation
      </button>
      {list.length === 0 ? (
        <p className={styles.empty}>No saved conversations yet.</p>
      ) : (
        <ul className={styles.list}>
          {list.map(({id, title}) => (
            <li key={id} className={styles.item}>
              <button
                type="button"
                className={styles.open}
                aria-current={id === currentId ? 'true' : undefined}
                onClick={() => pick(() => open(id))}
              >
                {title}
              </button>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Delete conversation: ${title}`}
                onClick={() => remove(id)}
              >
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
