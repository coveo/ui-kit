import {useConversations} from '../../context/session.js';
import {useMediaQuery} from '../../hooks/use-media-query.js';
import {CloseIcon} from '../../a2ui/icons/index.js';
import styles from './ConversationDrawer.module.css';

interface ConversationDrawerProps {
  id: string;
  /** Closes the drawer and gives the focus back to its toggle. */
  onClose: () => void;
}

/**
 * Lists the saved conversations, newest first, to open or delete one, and starts a new one. On a
 * narrow screen it slides over the page and closes once a conversation opens.
 */
export function ConversationDrawer({id, onClose}: ConversationDrawerProps) {
  const {list, currentId, start, open, remove} = useConversations();
  const overlay = useMediaQuery('(max-width: 767px)');

  const pick = (swap: () => void) => {
    swap();
    if (overlay) {
      onClose();
    }
  };

  return (
    <nav
      id={id}
      className={styles.drawer}
      aria-label="Conversations"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
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
