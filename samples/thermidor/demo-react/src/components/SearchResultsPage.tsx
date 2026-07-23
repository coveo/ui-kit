import {useState, useRef, useEffect} from 'react';
import type {RoutedInterface} from '@coveo/thermidor';
import {
  SECTION_ACTIONS,
  type SuggestionItem,
} from './SuggestionsDropdown/index.js';
import {PromptInput} from './PromptInput/PromptInput.js';
import {useSuggestions} from '../hooks/use-suggestions.js';
import styles from './SearchResultsPage.module.css';

interface SearchResultsPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  routedInterface: RoutedInterface;
}

export function SearchResultsPage({
  onSubmit,
  isStreaming,
  routedInterface,
}: SearchResultsPageProps) {
  const {sections} = useSuggestions({
    inputValue: '',
    context: 'search-results',
  });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleSuggestionSelect = (item: SuggestionItem, sectionId: string) => {
    const action = SECTION_ACTIONS[sectionId];
    if (action === 'toast') {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToast('Not supported yet');
      toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    } else {
      onSubmit(item.label);
    }
  };

  return (
    <section>
      <h1>Search Results</h1>
      <p>Use case: {routedInterface.useCase}</p>
      <PromptInput
        onSubmit={onSubmit}
        disabled={isStreaming}
        suggestions={sections}
        onSuggestionSelect={handleSuggestionSelect}
      />
      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </section>
  );
}
