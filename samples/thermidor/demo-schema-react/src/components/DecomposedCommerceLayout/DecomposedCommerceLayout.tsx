import {useCallback, useEffect, useMemo, useRef, useSyncExternalStore} from 'react';
import {useA2UI} from '@copilotkit/a2ui-renderer';
import {ProductListRenderer} from '../../a2ui/ProductList/ProductList.js';
import {PaginationRenderer} from '../../a2ui/Pagination/Pagination.js';
import {PageSizeSelector} from '../../a2ui/PageSizeSelector/PageSizeSelector.js';
import {SortRenderer} from '../../a2ui/Sort/Sort.js';
import {useRemoteController} from '../../a2ui/controllers.js';
import {getA2UIMessages} from '../../a2ui/surfaces.js';
import {useStateSource} from '../../a2ui/state-source-context.js';
import type {Activity} from '@coveo/thermidor';
import type {
  ProductListProps,
  PaginationProps,
  SortProps,
  SearchBoxProps,
} from '@coveo/thermidor-schema';
import styles from './DecomposedCommerceLayout.module.css';

interface DecomposedCommerceLayoutProps {
  surfaceId: string;
  surfaceType: string;
}

interface ComponentEntry {
  id: string;
  type: string;
  properties: Record<string, unknown>;
}

/**
 * Layout shell for decomposed commerce surfaces.
 *
 * Matches the SearchResultsPage visual: grid with sidebar on the left,
 * main content area on the right with top-row (query summary + sort),
 * product grid, and bottom-row (pagination).
 *
 * Finds components from the A2-UI surface state by `componentType` and arranges
 * them into spatial slots.
 *
 * Absent component slots render nothing (no error).
 */
export function DecomposedCommerceLayout({surfaceId}: DecomposedCommerceLayoutProps) {
  const {getSurface, clearSurfaces, processMessages, version} = useA2UI();

  const stateSource = useStateSource();
  const subscribe = useCallback(
    (onStoreChange: () => void) => stateSource.subscribe(onStoreChange),
    [stateSource]
  );
  const getActivities = useCallback(
    (): Activity[] | undefined =>
      (stateSource.state as {activeTurn?: {agentResponse?: {activities?: Activity[]}}}).activeTurn
        ?.agentResponse?.activities,
    [stateSource]
  );
  const activities = useSyncExternalStore(subscribe, getActivities, getActivities);

  const a2uiMessages = useMemo(() => getA2UIMessages(activities), [activities]);
  const serializedMessages = useMemo(() => JSON.stringify(a2uiMessages), [a2uiMessages]);

  const actionsRef = useRef({clearSurfaces, processMessages});
  actionsRef.current = {clearSurfaces, processMessages};

  useEffect(() => {
    const {clearSurfaces, processMessages} = actionsRef.current;
    clearSurfaces();
    if (serializedMessages !== '[]') {
      processMessages(JSON.parse(serializedMessages) as Record<string, unknown>[]);
    }
  }, [serializedMessages]);

  const surface = getSurface(surfaceId);

  const components = useMemo(() => {
    if (!surface) return [];
    const entries: ComponentEntry[] = [];
    for (const [, model] of surface.componentsModel.entries) {
      entries.push({
        id: model.id,
        type: model.type,
        properties: model.properties,
      });
    }
    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface, version]);

  const searchBox = findByComponentType(components, 'search-box');
  const sort = findByComponentType(components, 'sort');
  const productList = findByComponentType(components, 'product-list');
  const pagination = findByComponentType(components, 'pagination');

  if (!surface) {
    return null;
  }

  return (
    <div data-testid="decomposed-commerce-layout">
      <div className={styles.page}>
        <aside className={styles.sidebar}>Facets (coming soon)</aside>
        <main className={styles.main}>
          <div className={styles.topRow}>
            {searchBox && pagination && productList && (
              <QuerySummary
                searchBoxProps={searchBox.properties as unknown as SearchBoxProps}
                paginationProps={pagination.properties as unknown as PaginationProps}
                productListProps={productList.properties as unknown as ProductListProps}
              />
            )}
            {sort && <SortRenderer props={sort.properties as unknown as SortProps} />}
          </div>
          {productList && (
            <ProductListRenderer props={productList.properties as unknown as ProductListProps} />
          )}
          <div className={styles.bottomRow}>
            {pagination && (
              <PaginationRenderer props={pagination.properties as unknown as PaginationProps} />
            )}
            {pagination && (
              <PageSizeSelector props={pagination.properties as unknown as PaginationProps} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function QuerySummary({
  searchBoxProps,
  paginationProps,
  productListProps,
}: {
  searchBoxProps: SearchBoxProps;
  paginationProps: PaginationProps;
  productListProps: ProductListProps;
}) {
  const stateSource = useStateSource();
  const searchBoxCtrl = useRemoteController(
    stateSource,
    searchBoxProps.componentId,
    searchBoxProps.componentType
  );
  const paginationCtrl = useRemoteController(
    stateSource,
    paginationProps.componentId,
    paginationProps.componentType
  );
  const productListCtrl = useRemoteController(
    stateSource,
    productListProps.componentId,
    productListProps.componentType
  );

  const query = searchBoxCtrl.state?.query ?? '';
  const page = paginationCtrl.state?.page ?? 0;
  const pageSize = paginationCtrl.state?.pageSize ?? 20;
  const totalEntries = paginationCtrl.state?.totalEntries ?? 0;
  const productCount = productListCtrl.state?.products?.length ?? 0;

  if (totalEntries === 0 && !query) {
    return null;
  }

  if (totalEntries === 0 && query) {
    return (
      <p className={styles.summary}>
        No results for <strong>{query}</strong>
      </p>
    );
  }

  const firstIndex = page * pageSize + 1;
  const lastIndex = page * pageSize + productCount;

  return (
    <p className={styles.summary}>
      Products <strong>{firstIndex}</strong>-<strong>{lastIndex}</strong> of{' '}
      <strong>{totalEntries.toLocaleString()}</strong>
      {query && (
        <>
          {' '}
          for <strong>{query}</strong>
        </>
      )}
    </p>
  );
}

function findByComponentType(
  components: ComponentEntry[],
  componentType: string
): ComponentEntry | undefined {
  return components.find((c) => c.properties.componentType === componentType);
}
