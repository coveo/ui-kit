import {useEffect, useRef} from 'react';
import type {Product} from '@coveo/headless/commerce';

import {MessageInput} from './MessageInput.js';

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

interface SearchResultsElement extends HTMLElement {
  searchState: {
    data: Array<{id: string; image: string; title: string; price: string}>;
    loading: boolean;
    error: string | null;
    query: string;
    page: number;
    hasMore: boolean;
  };
  onLoadMore?: () => void;
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
  const searchResultsRef = useRef<SearchResultsElement | null>(null);

  useEffect(() => {
    if (searchResultsRef.current) {
      // Map headless products to the shape the web component expects
      searchResultsRef.current.searchState = {
        data: products.map((p) => ({
          id: p.ec_product_id ?? p.permanentid,
          image: p.ec_images?.[0] ?? p.ec_thumbnails?.[0] ?? '',
          title: p.ec_name ?? '',
          price: String(p.ec_promo_price ?? p.ec_price ?? ''),
        })),
        loading: isLoading,
        error: null,
        query,
        page: 0,
        hasMore: false,
      };
    }
  }, [products, isLoading, query]);

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
      <atomock-search-results ref={searchResultsRef} />
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
