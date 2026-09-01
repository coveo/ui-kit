import {describe, it, expect, beforeEach} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';

const {matchSchemaPrompt, buildSearchActionEvents} = converseSchemaResponses;

// The surface now keeps an in-memory view across calls, so reset it to defaults before any
// assertion that assumes a fresh surface by rebuilding the initial "wetsuits" response.
function resetSurface(): ConverseEvent[] {
  return matchSchemaPrompt('wetsuits');
}

function findStateSnapshotComponents(events: ConverseEvent[]): Record<string, unknown> {
  const snapshotEvent = events.find(
    (e) =>
      e.event === 'message' &&
      (e.data as Record<string, unknown>).type === 'STATE_SNAPSHOT' &&
      (e.data as Record<string, unknown>).snapshot !== undefined &&
      Object.keys((e.data as Record<string, unknown>).snapshot as object).length > 0
  );
  const snapshot = (snapshotEvent!.data as Record<string, unknown>).snapshot as Record<
    string,
    unknown
  >;
  return snapshot.components as Record<string, unknown>;
}

describe('schema-response-search decomposed surface structure', () => {
  const events: ConverseEvent[] = resetSurface();

  const activitySnapshot = events.find(
    (e) =>
      e.event === 'ACTIVITY_SNAPSHOT' &&
      (e.data as Record<string, unknown>).activityType === 'a2ui-surface'
  );

  const stateSnapshot = events.find(
    (e) =>
      e.event === 'message' &&
      (e.data as Record<string, unknown>).type === 'STATE_SNAPSHOT' &&
      (e.data as Record<string, unknown>).snapshot !== undefined &&
      Object.keys((e.data as Record<string, unknown>).snapshot as object).length > 0
  );

  describe('createSurface activity snapshot', () => {
    it('emits an ACTIVITY_SNAPSHOT with a2ui-surface type', () => {
      expect(activitySnapshot).toBeDefined();
      expect((activitySnapshot!.data as Record<string, unknown>).activityType).toBe('a2ui-surface');
    });

    it('includes surfaceType: commerceSearch in the createSurface payload', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;

      expect(createSurface.surfaceType).toBe('commerceSearch');
    });

    it('includes individual decomposed components', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const components = createSurface.components as Array<Record<string, unknown>>;

      const componentIds = components.map((c) => c.id);

      expect(componentIds).toContain('search-box-1');
      expect(componentIds).toContain('product-list-1');
      expect(componentIds).toContain('pagination-1');
      expect(componentIds).toContain('sort-1');
    });

    it('has correct componentType in props for each component', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const components = createSurface.components as Array<Record<string, unknown>>;

      const componentMap = new Map(components.map((c) => [c.id, c]));

      expect(
        (componentMap.get('search-box-1')!.props as Record<string, unknown>).componentType
      ).toBe('search-box');
      expect(
        (componentMap.get('product-list-1')!.props as Record<string, unknown>).componentType
      ).toBe('product-list');
      expect(
        (componentMap.get('pagination-1')!.props as Record<string, unknown>).componentType
      ).toBe('pagination');
      expect((componentMap.get('sort-1')!.props as Record<string, unknown>).componentType).toBe(
        'sort'
      );
    });

    it('does not contain a monolithic ProductSearchSurface root component', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const components = createSurface.components as Array<Record<string, unknown>>;

      const componentNames = components.map((c) => c.component);

      expect(componentNames).not.toContain('ProductSearchSurface');
      expect(componentNames).not.toContain('ProductListingSurface');
    });
  });

  describe('state snapshot with component state', () => {
    it('emits a STATE_SNAPSHOT event with component state data', () => {
      expect(stateSnapshot).toBeDefined();
    });

    function getComponents(): Record<string, unknown> {
      const snapshot = (stateSnapshot!.data as Record<string, unknown>).snapshot as Record<
        string,
        unknown
      >;
      return snapshot.components as Record<string, unknown>;
    }

    it('delivers state for search-box-1 with query', () => {
      const components = getComponents();
      const searchBoxState = components['search-box-1'] as Record<string, unknown>;

      expect(searchBoxState).toBeDefined();
      expect(typeof searchBoxState.query).toBe('string');
    });

    it('delivers state for product-list-1 with products array', () => {
      const components = getComponents();
      const productListState = components['product-list-1'] as Record<string, unknown>;

      expect(productListState).toBeDefined();
      expect(Array.isArray(productListState.products)).toBe(true);
      expect((productListState.products as unknown[]).length).toBeGreaterThan(0);
    });

    it('delivers state for pagination-1 with page, pageSize, totalEntries, totalPages', () => {
      const components = getComponents();
      const paginationState = components['pagination-1'] as Record<string, unknown>;

      expect(paginationState).toBeDefined();
      expect(typeof paginationState.page).toBe('number');
      expect(typeof paginationState.pageSize).toBe('number');
      expect(typeof paginationState.totalEntries).toBe('number');
      expect(typeof paginationState.totalPages).toBe('number');
    });

    it('delivers state for sort-1 with appliedSort and availableSorts', () => {
      const components = getComponents();
      const sortState = components['sort-1'] as Record<string, unknown>;

      expect(sortState).toBeDefined();
      expect(sortState.appliedSort).toBeDefined();
      expect(Array.isArray(sortState.availableSorts)).toBe(true);
    });
  });
});

describe('schema-response-search initial response totals', () => {
  const events = resetSurface();
  const components = findStateSnapshotComponents(events);

  it('uses a pageSize of 12 with real product totals across 2 pages', () => {
    const pagination = components['pagination-1'] as Record<string, unknown>;
    const productList = components['product-list-1'] as Record<string, unknown>;

    expect(pagination.page).toBe(0);
    expect(pagination.pageSize).toBe(12);
    expect(pagination.totalEntries).toBe(18);
    expect(pagination.totalPages).toBe(2);
    // Page 0 slice is capped at the page size.
    expect((productList.products as unknown[]).length).toBe(12);
  });
});

describe('schema-response-search action-driven recomputation', () => {
  // State now persists across calls, so reset the surface to defaults before each test.
  beforeEach(() => {
    resetSurface();
  });

  function findActivitySnapshot(events: ConverseEvent[]) {
    return events.find(
      (e) =>
        e.event === 'ACTIVITY_SNAPSHOT' &&
        (e.data as Record<string, unknown>).activityType === 'a2ui-surface'
    );
  }

  it('selectPage returns the requested page and its product slice', () => {
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 1}});
    const components = findStateSnapshotComponents(events);
    const pagination = components['pagination-1'] as Record<string, unknown>;
    const productList = components['product-list-1'] as Record<string, unknown>;

    expect(pagination.page).toBe(1);
    expect(pagination.pageSize).toBe(12);
    // 18 products, page size 12 => page 1 holds the remaining 6.
    expect((productList.products as unknown[]).length).toBe(6);
  });

  it('selectSort with price_asc sorts by ascending price on page 0', () => {
    const events = buildSearchActionEvents({
      name: 'selectSort',
      context: {sortCriteria: 'price_asc'},
    });
    const components = findStateSnapshotComponents(events);
    const pagination = components['pagination-1'] as Record<string, unknown>;
    const sort = components['sort-1'] as Record<string, unknown>;
    const productList = components['product-list-1'] as Record<string, unknown>;
    const prices = (productList.products as Array<Record<string, unknown>>).map(
      (p) => p.ec_price as number
    );

    expect(pagination.page).toBe(0);
    expect((sort.appliedSort as Record<string, unknown>).sortCriteria).toBe('price_asc');
    const sortedAscending = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedAscending);
  });

  it('setPageSize recomputes pageSize and totalPages', () => {
    const events = buildSearchActionEvents({name: 'setPageSize', context: {pageSize: 6}});
    const components = findStateSnapshotComponents(events);
    const pagination = components['pagination-1'] as Record<string, unknown>;
    const productList = components['product-list-1'] as Record<string, unknown>;

    expect(pagination.page).toBe(0);
    expect(pagination.pageSize).toBe(6);
    expect(pagination.totalEntries).toBe(18);
    expect(pagination.totalPages).toBe(3);
    expect((productList.products as unknown[]).length).toBe(6);
  });

  it('does not re-create the surface (no ACTIVITY_SNAPSHOT) for action responses', () => {
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 1}});
    expect(findActivitySnapshot(events)).toBeUndefined();
  });
});

describe('schema-response-search stateful surface across actions', () => {
  beforeEach(() => {
    resetSurface();
  });

  it('preserves the sort criteria when changing page after sorting', () => {
    buildSearchActionEvents({name: 'selectSort', context: {sortCriteria: 'price_asc'}});
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 1}});
    const components = findStateSnapshotComponents(events);
    const sort = components['sort-1'] as Record<string, unknown>;
    const pagination = components['pagination-1'] as Record<string, unknown>;

    expect((sort.appliedSort as Record<string, unknown>).sortCriteria).toBe('price_asc');
    expect(pagination.page).toBe(1);
  });

  it('preserves the page size when changing page after resizing', () => {
    buildSearchActionEvents({name: 'setPageSize', context: {pageSize: 6}});
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 2}});
    const components = findStateSnapshotComponents(events);
    const pagination = components['pagination-1'] as Record<string, unknown>;

    expect(pagination.pageSize).toBe(6);
    expect(pagination.page).toBe(2);
  });

  it('resets the view to defaults when the initial wetsuits response is rebuilt', () => {
    buildSearchActionEvents({name: 'selectSort', context: {sortCriteria: 'price_desc'}});
    buildSearchActionEvents({name: 'setPageSize', context: {pageSize: 6}});
    buildSearchActionEvents({name: 'selectPage', context: {page: 2}});

    const events = matchSchemaPrompt('wetsuits');
    const components = findStateSnapshotComponents(events);
    const pagination = components['pagination-1'] as Record<string, unknown>;
    const sort = components['sort-1'] as Record<string, unknown>;

    expect(pagination.page).toBe(0);
    expect(pagination.pageSize).toBe(12);
    expect((sort.appliedSort as Record<string, unknown>).sortCriteria).toBe('relevance');
  });
});
