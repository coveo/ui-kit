import {PromptInput} from '../PromptInput/PromptInput.js';
import {SuggestionPills} from '../SuggestionPills/SuggestionPills.js';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  error: string | null;
}

export function LandingPage({onSubmit, isStreaming, error}: LandingPageProps) {
  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>What can I help you find?</h1>
        <div className={styles.inputWrapper}>
          <PromptInput
            onSubmit={onSubmit}
            disabled={isStreaming}
            placeholder="Search for products or ask a question..."
          />
        </div>
        <SuggestionPills onSelect={onSubmit} disabled={isStreaming} />
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
