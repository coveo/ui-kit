import type {ReactNode} from 'react';
import {SECTION_ACTIONS, type SuggestionItem} from '../SuggestionsDropdown/index.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import {SuggestionPills} from '../SuggestionPills/SuggestionPills.js';
import {useSuggestions} from '../../hooks/use-suggestions.js';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  /** Ways in other than a prompt, such as conversations to come back to, below the suggestions. */
  children?: ReactNode;
}

export function LandingPage({onSubmit, isStreaming, children}: LandingPageProps) {
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
            placeholder="Ask anything..."
            suggestions={sections}
            onSuggestionSelect={handleSuggestionSelect}
          />
        </div>
        <div className={styles.pillsWrapper}>
          <SuggestionPills onSelect={onSubmit} disabled={isStreaming} />
        </div>
        {children && <div className={styles.otherWaysIn}>{children}</div>}
      </div>
    </section>
  );
}
