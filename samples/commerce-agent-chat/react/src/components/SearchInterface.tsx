import {useEffect, useRef} from 'react';

import type {SearchResultsState} from '@core/lib/chatStore.js';

import {MessageInput} from './MessageInput.js';

interface SearchInterfaceProps {
  searchState: SearchResultsState;
  onSend: (content: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  aiEnabled: boolean;
  onToggleAi: (enabled: boolean) => void;
  shouldFocusInput: boolean;
  onFocusHandled: () => void;
  onLoadMore: () => void;
}

interface SearchResultsElement extends HTMLElement {
  searchState: SearchResultsState;
}

export function SearchInterface({
  searchState,
  onSend,
  value,
  onValueChange,
  aiEnabled,
  onToggleAi,
  shouldFocusInput,
  onFocusHandled,
  onLoadMore,
}: SearchInterfaceProps): React.JSX.Element {
  const searchResultsRef = useRef<SearchResultsElement | null>(null);

  useEffect(() => {
    if (searchResultsRef.current) {
      searchResultsRef.current.searchState = searchState;
    }
  }, [searchState]);

  useEffect(() => {
    const element = searchResultsRef.current;
    if (!element) {
      return;
    }

    const handleLoadMoreEvent = () => {
      onLoadMore();
    };

    element.addEventListener('search-load-more', handleLoadMoreEvent);
    return () => {
      element.removeEventListener('search-load-more', handleLoadMoreEvent);
    };
  }, [onLoadMore]);

  return (
    <section className="search-mode-shell" aria-label="Search mode">
      <div className="search-mode-input-wrap">
        <MessageInput
          onSend={onSend}
          value={value}
          onValueChange={onValueChange}
          disabled={searchState.loading}
          placeholder="Search..."
          aiEnabled={aiEnabled}
          onToggleAi={onToggleAi}
          shouldFocusInput={shouldFocusInput}
          onFocusHandled={onFocusHandled}
        />
      </div>
      <atomock-search-results ref={searchResultsRef} />
    </section>
  );
}
