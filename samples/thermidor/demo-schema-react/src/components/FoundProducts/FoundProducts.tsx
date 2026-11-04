import type {AddedMessage, AddedMessageStatus, FoundProduct, Turn} from '@coveo/thermidor';
import {actionsDuringAnswerEnabled} from '../../env.js';
import {formatPrice} from '../../utils.js';
import styles from './FoundProducts.module.css';

/**
 * Whether `turn` shows the products its agent found: while the answer works, or once it stopped
 * before showing its own. Reacting needs actions during an answer.
 */
export function showsFoundProducts(turn: Turn): boolean {
  return (
    actionsDuringAnswerEnabled() &&
    (turn.foundProducts?.length ?? 0) > 0 &&
    (turn.status === 'streaming' || turn.stopped === true)
  );
}

/** At most this many found products show: the first ones are what a shopper reacts to. */
const MAX_SHOWN = 8;

type Reaction = 'more' | 'leaveOut';

const REACTIONS: readonly {kind: Reaction; label: string}[] = [
  {kind: 'more', label: 'More like this'},
  {kind: 'leaveOut', label: 'Leave out'},
];

/**
 * What the shopper says to the answer when reacting to `name`. A reaction that comes after the
 * answer ended is asked as the next question, so it starts with "Show me": the gateway's intent
 * routing sends that to the agent, never to a keyword search.
 */
export function reactionMessage(kind: Reaction, name: string): string {
  return kind === 'more' ? `Show me more like the ${name}` : `Show me options without the ${name}`;
}

/** What a sent reaction shows, by where its message stands. */
function sentText(kind: Reaction, status: AddedMessageStatus): string {
  if (status === 'notAdded') {
    return 'Not added: the answer was stopped';
  }
  const done = kind === 'more' ? 'Asked for more like this' : 'Left out';
  return status === 'sending' || status === 'waiting' ? `${done}…` : done;
}

interface FoundProductsProps {
  products: readonly FoundProduct[];
  /** The messages added to the answer, which include the reactions already sent. */
  addedMessages?: readonly AddedMessage[];
  /** Sends a reaction: added to the answer while it streams, asked next otherwise. */
  onReact: (message: string) => void;
}

/**
 * PROTOTYPE (HACK-408): the products the agent found while it answers, before the answer shows its
 * own. The shopper steers the answer by reacting to them: more like one, or leave one out.
 */
export function FoundProducts({products, addedMessages = [], onReact}: FoundProductsProps) {
  function sentReaction(name: string): {kind: Reaction; status: AddedMessageStatus} | undefined {
    for (const {kind} of REACTIONS) {
      const message = addedMessages.find(({text}) => text === reactionMessage(kind, name));
      if (message) {
        return {kind, status: message.status};
      }
    }
    return undefined;
  }

  return (
    <section className={styles.found} aria-label="Found so far">
      <p className={styles.title}>Found so far: react to steer the answer</p>
      <ul className={styles.list}>
        {products.slice(0, MAX_SHOWN).map((product) => {
          const sent = sentReaction(product.name);
          return (
            <li key={product.id} className={styles.product} aria-label={product.name}>
              {product.image ? (
                <img className={styles.image} src={product.image} alt="" loading="lazy" />
              ) : (
                <span className={styles.image} aria-hidden="true" />
              )}
              <span className={styles.name}>{product.name}</span>
              {product.price !== undefined && (
                <span className={styles.price}>{formatPrice(product.price)}</span>
              )}
              {sent ? (
                <span className={styles.sent} data-status={sent.status}>
                  {sentText(sent.kind, sent.status)}
                </span>
              ) : (
                <span className={styles.reactions}>
                  {REACTIONS.map(({kind, label}) => (
                    <button
                      key={kind}
                      type="button"
                      className={styles.reaction}
                      onClick={() => onReact(reactionMessage(kind, product.name))}
                    >
                      {label}
                    </button>
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
