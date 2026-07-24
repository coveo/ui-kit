import {useState, useRef, useEffect} from 'react';
import type {RoutedInterface} from '@coveo/thermidor';
import {
  buildProductListController,
  buildPaginationController,
  buildSearchBoxController,
} from '@coveo/thermidor';
import {SECTION_ACTIONS, type SuggestionItem} from '../SuggestionsDropdown/index.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import {useSuggestions} from '../../hooks/use-suggestions.js';
import {useBuildController} from '../../hooks/use-build-controller.js';
import {ProductGrid} from './ProductGrid/ProductGrid.js';
import {Pagination} from './Pagination/Pagination.js';
import {QuerySummaryPlaceholder} from './QuerySummaryPlaceholder/QuerySummaryPlaceholder.js';
import {SortPlaceholder} from './SortPlaceholder/SortPlaceholder.js';
import {PageSizeSelector} from './PageSizeSelector/PageSizeSelector.js';
import styles from './SearchResultsPage.module.css';

interface SearchResultsPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  routedInterface: RoutedInterface;
}

export function SearchResultsPage(props: SearchResultsPageProps) {
  if (!props.routedInterface) {
    return null;
  }

  return <SearchResultsPageInner {...props} />;
}

function SearchResultsPageInner({onSubmit, isStreaming, routedInterface}: SearchResultsPageProps) {
  const [productListController, productListState] = useBuildController(() =>
    buildProductListController({interface: routedInterface.interface})
  );
  const [paginationController, paginationState] = useBuildController(() =>
    buildPaginationController({interface: routedInterface.interface})
  );
  const [, searchBoxState] = useBuildController(() =>
    buildSearchBoxController({interface: routedInterface.interface})
  );

  const {sections} = useSuggestions({
    inputValue: searchBoxState.query ?? '',
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

  const showToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast('Not supported yet');
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleSuggestionSelect = (item: SuggestionItem, sectionId: string) => {
    const action = SECTION_ACTIONS[sectionId];
    if (action === 'toast') {
      showToast();
    } else {
      onSubmit(item.label);
    }
  };

  return (
    <div className={styles.page} data-testid="search-results-page">
      <header className={styles.header}>
        <PromptInput
          onSubmit={onSubmit}
          disabled={isStreaming}
          initialValue={searchBoxState.query ?? ''}
          suggestions={sections}
          onSuggestionSelect={handleSuggestionSelect}
        />
      </header>

      <aside className={styles.sidebar}>Facets (coming soon)</aside>

      <main className={styles.main}>
        <div className={styles.topRow}>
          <QuerySummaryPlaceholder
            query={searchBoxState.query ?? ''}
            totalCount={paginationState.totalCount ?? 0}
            firstResult={(paginationState.page ?? 0) * (paginationState.pageSize ?? 0)}
            pageSize={paginationState.pageSize ?? 0}
            productCount={productListState.products?.length ?? 0}
          />
          <SortPlaceholder onToast={showToast} />
        </div>
        <ProductGrid controller={productListController} />
        <div className={styles.bottomRow}>
          <Pagination controller={paginationController} />
          <PageSizeSelector controller={paginationController} />
        </div>
      </main>

      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
