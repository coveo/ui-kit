import {ChatPanel} from '../components/ChatPanel.js';
import styles from './pages.module.css';

/**
 * The home page (`storefront-preview-home`). The server has nothing to answer it with, and a
 * request needs a message, so it sends nothing until the session can open itself (`initialize`). The assistant's chat
 * panel sits on it, on the home page's visit.
 */
export function HomePage({visitId}: {visitId: number}) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Home</h1>
      <p className={styles.note}>
        Search the catalog, or ask the assistant a question ending with “?”. Every page shares one
        session.
      </p>
      <ChatPanel visitId={visitId} />
    </main>
  );
}
