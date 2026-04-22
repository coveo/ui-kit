import type {Product} from '@coveo/headless/commerce';

import {MessageInput} from './MessageInput.js';
import {SearchResults} from './SearchResults.js';

interface SearchInterfaceProps {
  products: Product[];
  isLoading: boolean;
  query: string;
  onSend: (content: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  shouldFocusInput: boolean;
  onFocusHandled: () => void;
  isClassifying?: boolean;
  onBack?: () => void;
}

export function SearchInterface({
  products,
  isLoading,
  query,
  onSend,
  value,
  onValueChange,
  shouldFocusInput,
  onFocusHandled,
  isClassifying = false,
  onBack,
}: SearchInterfaceProps): React.JSX.Element {
  return (
    <section className="search-mode-shell" aria-label="Search mode">
      <div className="search-mode-input-wrap">
        <MessageInput
          onSend={onSend}
          value={value}
          onValueChange={onValueChange}
          disabled={isLoading}
          placeholder="Search..."
          isClassifying={isClassifying}
          shouldFocusInput={shouldFocusInput}
          onFocusHandled={onFocusHandled}
        />
      </div>
      <SearchResults products={products} isLoading={isLoading} query={query} />
      {onBack && (
        <button
          type="button"
          className="ai-chat-btn"
          onClick={onBack}
          aria-label="Back to AI chat"
          title="Back to AI chat"
        >
          <span aria-hidden="true">✨</span>
        </button>
      )}
    </section>
  );
}
