import {useState} from 'react';
import {SECTION_ACTIONS, type SuggestionItem} from '../SuggestionsDropdown/index.js';
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
  const [inputValue, setInputValue] = useState('');
  const [inputKey, setInputKey] = useState(0);

  const handleSuggestionSelect = (item: SuggestionItem, sectionId: string) => {
    const action = SECTION_ACTIONS[sectionId];
    if (action === 'submit') {
      onSubmit(item.label);
    }
  };

  const handlePillSelect = (suggestion: string) => {
    setInputValue(suggestion);
    setInputKey((k) => k + 1);
    onSubmit(suggestion);
  };

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>What can I help you find?</h1>
        <div className={styles.inputWrapper}>
          <PromptInput
            key={inputKey}
            onSubmit={onSubmit}
            disabled={isStreaming}
            placeholder="Search for products or ask a question..."
            initialValue={inputValue}
            suggestions={sections}
            onSuggestionSelect={handleSuggestionSelect}
          />
        </div>
        <div className={styles.pillsWrapper}>
          <SuggestionPills onSelect={handlePillSelect} disabled={isStreaming} />
        </div>
      </div>
    </section>
  );
}
