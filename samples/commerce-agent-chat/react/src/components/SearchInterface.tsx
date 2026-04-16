import {useEffect, useRef} from 'react';

import type {SearchResultsState} from '@core/lib/chatStore.js';

import {MessageInput} from './MessageInput.js';

interface SearchInterfaceProps {
  searchState: SearchResultsState;
  onSend: (content: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  shouldFocusInput: boolean;
  onFocusHandled: () => void;
  onLoadMore: () => void;
  isClassifying?: boolean;
  onBack?: () => void;
}

interface SearchResultsElement extends HTMLElement {
  searchState: SearchResultsState;
}

export function SearchInterface({
  searchState,
  onSend,
  value,
  onValueChange,
  shouldFocusInput,
  onFocusHandled,
  onLoadMore,
  isClassifying = false,
  onBack,
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
      {onBack && (
        <button
          type="button"
          className="back-to-chat-btn"
          onClick={onBack}
          aria-label="Back to chat"
        >
          ← Back to chat
        </button>
      )}
      <div className="search-mode-input-wrap">
        <MessageInput
          onSend={onSend}
          value={value}
          onValueChange={onValueChange}
          disabled={searchState.loading}
          placeholder="Search..."
          isClassifying={isClassifying}
          shouldFocusInput={shouldFocusInput}
          onFocusHandled={onFocusHandled}
        />
      </div>
      <atomock-search-results ref={searchResultsRef} />
    </section>
  );
}
