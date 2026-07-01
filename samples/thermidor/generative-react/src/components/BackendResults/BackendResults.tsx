import {useState, useEffect, useRef} from 'react';
import {
  buildBackendProductListController,
  buildBackendPaginationController,
  type BackendProductListController,
  type BackendPaginationController,
} from '@coveo/thermidor';
import {
  converseController,
  generativeInterface,
} from '../../generative-setup.js';
import {getOrCreateBackendInterfacesSelectors} from '@/src/core/internal/backend-interfaces/backend-interfaces-selectors.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {FacetPanel} from '../FacetPanel/FacetPanel.js';
import {SortDropdown} from '../SortDropdown/SortDropdown.js';
import {
  useUrlManager,
  useSessionTokenPersistence,
  useInitialUrlRestore,
} from '../../hooks/useUrlManager.js';
import styles from './BackendResults.module.css';

export function BackendResults() {
  const [interfaces, setInterfaces] = useState<
    Record<
      string,
      {type: string; display: string; state: Record<string, unknown>}
    >
  >({});
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 0,
    totalCount: 0,
    totalPages: 0,
  });
  const controllersRef = useRef<{
    productList?: BackendProductListController;
    pagination?: BackendPaginationController;
    interfaceId?: string;
  }>({});

  const engine = generativeInterface[ENGINE];
  const stateId = generativeInterface[STATE_ID];

  useSessionTokenPersistence();
  useInitialUrlRestore();

  useEffect(() => {
    const selectors = getOrCreateBackendInterfacesSelectors(stateId);
    return engine.subscribe(selectors.getInterfaces, (newInterfaces) => {
      setInterfaces(newInterfaces);
    });
  }, [engine, stateId]);

  const firstInterfaceId = Object.keys(interfaces).find(
    (id) => interfaces[id]?.display === 'main'
  );

  useUrlManager(firstInterfaceId);

  useEffect(() => {
    if (
      !firstInterfaceId ||
      controllersRef.current.interfaceId === firstInterfaceId
    ) {
      if (firstInterfaceId && controllersRef.current.productList) {
        setProducts(controllersRef.current.productList.state.products);
        setPagination(controllersRef.current.pagination!.state);
      }
      return;
    }

    const productList = buildBackendProductListController({
      interface: generativeInterface,
      interfaceId: firstInterfaceId,
    });

    const paginationCtrl = buildBackendPaginationController({
      interface: generativeInterface,
      converseController,
      interfaceId: firstInterfaceId,
    });

    controllersRef.current = {
      productList,
      pagination: paginationCtrl,
      interfaceId: firstInterfaceId,
    };
    setProducts(productList.state.products);
    setPagination(paginationCtrl.state);

    const unsub1 = productList.subscribe(() =>
      setProducts(productList.state.products)
    );
    const unsub2 = paginationCtrl.subscribe(() =>
      setPagination(paginationCtrl.state)
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [firstInterfaceId]);

  const query = (interfaces[firstInterfaceId!]?.state?.query as string) ?? '';
  const facets =
    (interfaces[firstInterfaceId!]?.state?.facets as Array<{
      facetId: string;
      field: string;
      displayName: string;
      type: string;
      values: Array<{
        value: string;
        state: 'idle' | 'selected' | 'excluded';
        numberOfResults: number;
      }>;
      moreValuesAvailable: boolean;
    }>) ?? [];
  const [queryInput, setQueryInput] = useState(query);

  useEffect(() => {
    setQueryInput(query);
  }, [query]);

  if (!firstInterfaceId) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      converseController.sendAction({
        type: 'execute_search',
        query: queryInput.trim(),
      });
    }
  };

  return (
    <aside className={styles.panel}>
      <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
        <input
          className={styles.searchInput}
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Search products..."
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>
      <div className={styles.toolbar}>
        <div className={styles.meta}>
          {pagination.totalCount} results — Page {pagination.page + 1} of{' '}
          {pagination.totalPages}
        </div>
        <SortDropdown interfaceId={firstInterfaceId} />
      </div>
      <div className={styles.body}>
        <FacetPanel interfaceId={firstInterfaceId} facets={facets} />
        <div className={styles.grid}>
          {products.map((product, i) => (
            <div
              key={(product as any).permanentid ?? i}
              className={styles.card}
            >
              {(product as any).ec_thumbnails?.[0] && (
                <img
                  src={(product as any).ec_thumbnails[0]}
                  alt=""
                  className={styles.thumb}
                />
              )}
              <div className={styles.name}>
                {(product as any).ec_name ?? 'Untitled'}
              </div>
              <div className={styles.price}>
                {(product as any).ec_promo_price != null &&
                (product as any).ec_promo_price < (product as any).ec_price ? (
                  <>
                    <span className={styles.promo}>
                      ${(product as any).ec_promo_price}
                    </span>{' '}
                    <span className={styles.original}>
                      ${(product as any).ec_price}
                    </span>
                  </>
                ) : (
                  `$${(product as any).ec_price ?? '—'}`
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {pagination.totalPages > 1 && (
        <div className={styles.paginationBar}>
          <button
            disabled={pagination.page === 0}
            onClick={() =>
              controllersRef.current.pagination?.selectPage(pagination.page - 1)
            }
          >
            ← Prev
          </button>
          <button
            disabled={pagination.page >= pagination.totalPages - 1}
            onClick={() =>
              controllersRef.current.pagination?.selectPage(pagination.page + 1)
            }
          >
            Next →
          </button>
        </div>
      )}
    </aside>
  );
}
