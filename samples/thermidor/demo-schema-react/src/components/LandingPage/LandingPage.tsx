import {SearchBox} from '../SearchBox/SearchBox.js';
import {SuggestionPills} from '../SuggestionPills/SuggestionPills.js';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
}

export function LandingPage({onSubmit, isStreaming}: LandingPageProps) {
  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>What can I help you find?</h1>
        <div className={styles.inputWrapper}>
          <SearchBox onSubmit={onSubmit} isStreaming={isStreaming} placeholder="Ask anything..." />
        </div>
        <div className={styles.pillsWrapper}>
          <SuggestionPills onSelect={onSubmit} disabled={isStreaming} />
        </div>
      </div>
    </section>
  );
}
