import {
  SECTION_ACTIONS,
  type SuggestionItem,
} from '../SuggestionsDropdown/index.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import {SuggestionPills} from '../SuggestionPills/SuggestionPills.js';
import {useSuggestions} from '../../hooks/use-suggestions.js';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
}

export function LandingPage({onSubmit, isStreaming}: LandingPageProps) {
  const {sections} = useSuggestions({inputValue: '', context: 'landing'});

  const handleSuggestionSelect = (item: SuggestionItem, sectionId: string) => {
    const action = SECTION_ACTIONS[sectionId];
    if (action === 'submit') {
      onSubmit(item.label);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>What can I help you find?</h1>
        <div className={styles.inputWrapper}>
          <PromptInput
            onSubmit={onSubmit}
            disabled={isStreaming}
            placeholder="Search for products or ask a question..."
            suggestions={sections}
            onSuggestionSelect={handleSuggestionSelect}
          />
        </div>
        <SuggestionPills onSelect={onSubmit} disabled={isStreaming} />
      </div>
    </section>
  );
}
