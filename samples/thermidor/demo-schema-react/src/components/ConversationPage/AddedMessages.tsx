import type {AddedMessage, AddedMessageStatus} from '@coveo/thermidor';
import styles from './AddedMessages.module.css';

const STATUS_TEXT: Record<AddedMessageStatus, string> = {
  sending: 'Adding to this answer…',
  waiting: 'Adding to this answer…',
  applied: 'Added to this answer',
  askedNext: 'Asked next, after this answer',
  notAdded: 'Not added: the answer was stopped',
};

/** The messages the shopper added to an answer while it streamed, each with where it stands. */
export function AddedMessages({messages}: {messages: readonly AddedMessage[]}) {
  return (
    <ul className={styles.list} aria-label="Added to this answer">
      {messages.map(({id, text, status}) => (
        <li key={id} className={styles.item}>
          <p className={styles.bubble}>{text}</p>
          <p className={styles.status} data-status={status}>
            {STATUS_TEXT[status]}
          </p>
        </li>
      ))}
    </ul>
  );
}
