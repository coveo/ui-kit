import {useState, useRef, useEffect, useCallback} from 'react';
import type {RoutedInterface} from '@coveo/thermidor';
import {buildProductListController, buildPaginationController} from '@coveo/thermidor';
import {SECTION_ACTIONS, type SuggestionItem} from '../SuggestionsDropdown/index.js';
import {ProductTargeting} from '../ProductTargeting/ProductTargeting.js';
import {useTargeting, type TargetedProduct} from '../../context/targeting.js';
import {useSuggestions} from '../../hooks/use-suggestions.js';
import {useBuildController} from '../../hooks/use-build-controller.js';
import {ProductGrid} from './ProductGrid/ProductGrid.js';
import {Pagination} from './Pagination/Pagination.js';
import {QuerySummaryPlaceholder} from './QuerySummaryPlaceholder/QuerySummaryPlaceholder.js';
import {SortPlaceholder} from './SortPlaceholder/SortPlaceholder.js';
import {SortFiltersModal} from './SortFiltersModal/SortFiltersModal.js';
import {PageSizeSelector} from './PageSizeSelector/PageSizeSelector.js';
import styles from './SearchResultsPage.module.css';

interface SearchResultsPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  routedInterface: RoutedInterface;
  query?: string;
  onBackToConversation: () => void;
  products: TargetedProduct[];
  onProductsChange: (products: TargetedProduct[]) => void;
}

export function SearchResultsPage(props: SearchResultsPageProps) {
  if (!props.routedInterface) {
    return null;
  }

  return <SearchResultsPageInner {...props} />;
}

function SearchResultsPageInner({
  onSubmit,
  isStreaming,
  routedInterface,
  query,
  onBackToConversation,
  products,
  onProductsChange,
}: SearchResultsPageProps) {
  const [productListController, productListState] = useBuildController(() =>
    buildProductListController({interface: routedInterface.interface})
  );
  const [paginationController, paginationState] = useBuildController(() =>
    buildPaginationController({interface: routedInterface.interface})
  );

  const {sections} = useSuggestions({
    inputValue: query ?? '',
    context: 'search-results',
  });

  const [toast, setToast] = useState<string | null>(null);
  const [sortFiltersOpen, setSortFiltersOpen] = useState(false);
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

  const closeSortFilters = useCallback(() => setSortFiltersOpen(false), []);

  const handleSuggestionSelect = (item: SuggestionItem, sectionId: string) => {
    const action = SECTION_ACTIONS[sectionId];
    if (action === 'toast') {
      showToast();
    } else {
      onSubmit(item.label);
    }
  };

  return (
    <div className={styles.searchLayout}>
      <ProductTargeting
        products={products}
        onProductsChange={onProductsChange}
        onSubmit={onSubmit}
        isStreaming={isStreaming}
        promptProps={{
          initialValue: query ?? '',
          suggestions: sections,
          onSuggestionSelect: handleSuggestionSelect,
        }}
      >
        <SearchResultsPageContent
          query={query}
          productListController={productListController}
          productListState={productListState}
          paginationController={paginationController}
          paginationState={paginationState}
          showToast={showToast}
          sortFiltersOpen={sortFiltersOpen}
          setSortFiltersOpen={setSortFiltersOpen}
          closeSortFilters={closeSortFilters}
          toast={toast}
        />
      </ProductTargeting>
      <button
        type="button"
        className={styles.floatingBackButton}
        onClick={onBackToConversation}
        title="Back to conversation"
        aria-label="Back to conversation"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}

interface SearchResultsPageContentProps {
  query?: string;
  productListController: ReturnType<typeof buildProductListController>;
  productListState: ReturnType<typeof buildProductListController>['state'];
  paginationController: ReturnType<typeof buildPaginationController>;
  paginationState: ReturnType<typeof buildPaginationController>['state'];
  showToast: () => void;
  sortFiltersOpen: boolean;
  setSortFiltersOpen: (open: boolean) => void;
  closeSortFilters: () => void;
  toast: string | null;
}

function SearchResultsPageContent({
  query,
  productListController,
  productListState,
  paginationController,
  paginationState,
  showToast,
  sortFiltersOpen,
  setSortFiltersOpen,
  closeSortFilters,
  toast,
}: SearchResultsPageContentProps) {
  const targeting = useTargeting();
  const isTargeting = targeting?.isTargeting ?? false;

  return (
    <div className={styles.page} data-testid="search-results-page">
      <aside className={`${styles.sidebar} ${isTargeting ? styles.muted : ''}`}>
        Facets (coming soon)
      </aside>

      <main className={styles.main}>
        <div className={styles.topRow}>
          <QuerySummaryPlaceholder
            query={query ?? ''}
            totalCount={paginationState.totalCount ?? 0}
            firstResult={(paginationState.page ?? 0) * (paginationState.pageSize ?? 0)}
            pageSize={paginationState.pageSize ?? 0}
            productCount={productListState.products?.length ?? 0}
          />
          <span className={`${styles.desktopOnly} ${isTargeting ? styles.muted : ''}`}>
            <SortPlaceholder onToast={showToast} />
          </span>
          <button
            type="button"
            className={`${styles.sortFiltersButton} ${isTargeting ? styles.muted : ''}`}
            onClick={() => setSortFiltersOpen(true)}
          >
            Sort & Filters
          </button>
        </div>
        <ProductGrid controller={productListController} />
        <div className={`${styles.bottomRow} ${isTargeting ? styles.muted : ''}`}>
          <Pagination controller={paginationController} />
          <PageSizeSelector controller={paginationController} />
        </div>
      </main>

      <SortFiltersModal open={sortFiltersOpen} onClose={closeSortFilters} onToast={showToast} />

      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
