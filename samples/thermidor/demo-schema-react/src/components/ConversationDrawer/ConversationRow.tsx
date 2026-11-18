import styles from './ConversationDrawer.module.css';

/** Why the drawer cannot swap the conversation while it sends a request, which would cancel it. */
export const NOT_READY = 'Available once the conversation is ready';

interface ConversationRowProps {
  title: string;
  current: boolean;
  /** The id of the note saying why the conversation cannot be opened now, if it cannot. */
  openBlockedBy?: string;
  onOpen: () => void;
}

/** A saved conversation, which its title opens. */
export function ConversationRow({title, current, openBlockedBy, onOpen}: ConversationRowProps) {
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.open}
        aria-current={current ? 'true' : undefined}
        aria-disabled={openBlockedBy ? true : undefined}
        aria-describedby={openBlockedBy}
        title={openBlockedBy && NOT_READY}
        onClick={() => !openBlockedBy && onOpen()}
      >
        {title}
      </button>
    </div>
  );
}
